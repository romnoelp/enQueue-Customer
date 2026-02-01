import CustomerInformation from "@/app/_components/ContactCard";

export default function Page() {
  return (
    <div className="min-h-screen bg-transparent p-6 sm:p-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <CustomerInformation />
      </div>
    </div>
  );
}
