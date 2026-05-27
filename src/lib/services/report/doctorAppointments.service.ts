import { api } from "@/lib/api";
import { readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";

export type DoctorAppointmentsQuery = {
  from?: string;
  to?: string;
  userId?: number;
};

export type DoctorAppointmentsResponse = {
  message: string;
  data: {
    meta: {
      from: string;
      to: string;
    };
    stats: {
      total: number;
      completed: number;
      cancelled: number;
      scheduled: number;
    };
    dailyData: Array<{
      date: string;
      total: number;
      completed: number;
      cancelled: number;
    }>;
    topPatients: Array<{
      patientId: number;
      patientName: string;
      totalAppointments: number;
      completedAppointments: number;
      cancelledAppointments: number;
      lastAppointmentDate: string;
    }>;
  };
};

const buildEndpoint = (params: DoctorAppointmentsQuery = {}) => {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.userId) searchParams.set("userId", String(params.userId));
  const basePath = "/report/doctor/appointments";
  return searchParams.toString() ? `${basePath}?${searchParams.toString()}` : basePath;
};

export const getDoctorAppointmentsReport = async (
  params: DoctorAppointmentsQuery = {},
): Promise<DoctorAppointmentsResponse> => {
  const response = await api(buildEndpoint(params), { method: "GET" });
  if (!response.ok) throw new Error(await readEnvelopeErrorMessage(response));
  return (await response.json()) as DoctorAppointmentsResponse;
};
