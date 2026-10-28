// Frontend API Client for Project Compass

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// Compare 2-3 project ideas
export async function compareIdeas(ideas: {
  name: string;
  description: string;
  target_audience?: string;
  tech_stack?: string[];
  track?: string;
}[]) {
  return apiRequest<{
    winner: any;
    evaluations: any[];
    recommendations: string[];
    comparison_id: string;
  }>("/api/projects/compare", {
    method: "POST",
    body: JSON.stringify({ ideas }),
  });
}

// Generate Build Contract
export async function generateContract(payload: {
  project_name: string;
  archetype: string;
  target_audience: string;
  key_assumptions: string[];
  first_hour_milestone: string;
  out_of_scope: string[];
  suggested_stack?: Record<string, string>;
  comparison_id?: string;
}) {
  return apiRequest<any>("/api/contracts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Get Build Contract
export async function getContract(contractId: string) {
  return apiRequest<any>(`/api/contracts/${contractId}`);
}

// Submit Break My Build challenge
export async function submitChallenge(
  contractId: string,
  payload: {
    challenger_name: string;
    challenger_role?: string;
    challenge_type: string;
    critique: string;
    suggested_fix?: string;
  }
) {
  return apiRequest<any>(`/api/contracts/${contractId}/challenges`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Register for Demo Day workshop
export async function registerWorkshop(payload: {
  full_name: string;
  email: string;
  phone_whatsapp?: string;
  track?: string;
  github_handle?: string;
}) {
  return apiRequest<any>("/api/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Track growth event
export async function trackAnalyticsEvent(
  eventType: string,
  payload: Record<string, any> = {}
) {
  try {
    return await apiRequest<any>("/api/analytics/event", {
      method: "POST",
      body: JSON.stringify({
        event_type: eventType,
        payload,
      }),
    });
  } catch {
    // Silent fail for background telemetry
    return null;
  }
}

// Admin Metrics
export async function getAdminMetrics(token: string) {
  return apiRequest<any>(`/api/admin/metrics?token=${encodeURIComponent(token)}`);
}

// Reset Demo Data
export async function resetAdminData(token: string) {
  return apiRequest<any>(`/api/admin/reset?token=${encodeURIComponent(token)}`, {
    method: "POST",
  });
}

// WhatsApp Simulator
export async function simulateWhatsAppMessage(
  fromNumber: string,
  text: string
) {
  return apiRequest<any>("/api/whatsapp/simulate", {
    method: "POST",
    body: JSON.stringify({
      from_number: fromNumber,
      message_text: text,
    }),
  });
}

// WhatsApp Status
export async function getWhatsAppStatus() {
  return apiRequest<any>("/api/whatsapp/status");
}
