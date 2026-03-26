import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AWS Exam Preparation",
  description: "Prepare for your AWS certification exams with daily study plans, quizzes, and mock exams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
