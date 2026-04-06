import { redirect } from "next/navigation";

// Root route redirects to the submit form
export default function RootPage() {
  redirect("/submeter");
}
