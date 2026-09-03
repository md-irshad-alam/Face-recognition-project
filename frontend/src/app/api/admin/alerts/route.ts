import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. Extract authorization token if needed
    const authHeader = request.headers.get('authorization');
    
    // 2. Fetch the predictive risk alerts from the FastAPI Backend
    // Using the internal API URL, fallback to localhost for development
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.visio.school').replace(/\/+$/, '');
    
    // NOTE: You will need to create the corresponding endpoint in your FastAPI backend
    // to query the 'risk_alerts' table. e.g. @app.get("/admin/alerts")
    const res = await fetch(`${backendUrl}/admin/alerts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      // cache: 'no-store' // Ensure fresh data on every dashboard load
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const alerts = await res.json();

    // 3. Optional: Map or transform the data for the frontend dashboard
    const formattedAlerts = alerts.map((alert: any) => ({
      id: alert.id,
      studentId: alert.student_id,
      riskTier: alert.risk_tier,
      attendanceScore: alert.calculated_attendance,
      pendingDues: alert.pending_dues_count,
      status: alert.status,
      message: alert.pre_rendered_message,
      detectedAt: alert.detected_at,
      isCritical: alert.risk_tier === 'CRITICAL'
    }));

    return NextResponse.json({ success: true, data: formattedAlerts });

  } catch (error: any) {
    console.error('Error fetching risk alerts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch predictive alerts.', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  // Structure to handle updating an alert status (e.g. marking as 'reviewed')
  try {
    const body = await request.json();
    const { alertId, status } = body;
    
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.visio.school').replace(/\/+$/, '');
    const authHeader = request.headers.get('authorization');

    const res = await fetch(`${backendUrl}/admin/alerts/${alertId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify({ status })
    });

    if (!res.ok) throw new Error('Failed to update alert');
    
    return NextResponse.json({ success: true, message: 'Alert updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
