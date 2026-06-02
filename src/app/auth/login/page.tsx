export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cool-off-white p-4">
      <div className="w-full max-w-md rounded-lg bg-pure-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-deep-navy">CareFlow AI</h1>
        <p className="mb-6 text-sm text-cool-grey">Clinical Discharge Documentation</p>
        <p className="mb-4 text-xs text-warm-amber">
          By continuing, you consent to the processing of patient data in accordance with NDPR 2019.
        </p>
      </div>
    </div>
  );
}
