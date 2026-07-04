export type AlertState = {
    type: "success" | "error";
    message: string;
  };
  
  export function Alert({
    type,
    message,
  }: AlertState) {
    const styles =
      type === "success"
        ? "border-green-300 bg-green-50 text-green-700"
        : "border-red-300 bg-red-50 text-red-700";
  
    return (
      <div
        className={`mb-4 rounded border px-4 py-3 ${styles}`}
      >
        {message}
      </div>
    );
  }