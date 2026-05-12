export const emailConfig = {
  from: process.env.EMAIL_FROM ?? "noreply@foodzinder.com",
  replyTo: "soporte@foodzinder.com",
} as const;
