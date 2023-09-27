import { FormEventHandler, ReactNode } from "react";
import modalStyles from "/styles/modal.module.css";

export default function TextInputForm({
  children,
  onSubmit,
  label = "",
  pattern = "",
  tailMessage = "",
  id = "inputField",
}: {
  children: ReactNode;
  onSubmit: Function;
  label?: string;
  pattern?: string;
  tailMessage?: string;
  id?: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {children}
      {/* htmlFor value must match with querySelector argument in onSubmit callback */}
      <label htmlFor="inputField">{label}</label>
      <input
        style={{
          padding: "10px",
          fontSize: "16px",
          outline: "none",
          marginBottom: "10px",
          margin: "8px 0px 15px 35px",
          border: "1px solid #252525",
          borderRadius: "12px",
          width: "14rem",
        }}
        type="text"
        id={`${id}`}
        pattern={pattern}
        onInvalid={() => {
          console.log("invalid");
        }}
        required
      />
      <button
        style={{
          padding: "10px",
          fontSize: "16px",
          outline: "none",
          marginBottom: "10px",
          border: "1px solid #252525",
          borderRadius: "12px",
		  backgroundColor: "#007bff",
		  color: 'white',
        }}
        className={modalStyles.normalButton}
        type="submit"
      >
        확인
      </button>
      <p>{tailMessage}</p>
    </form>
  );
}
