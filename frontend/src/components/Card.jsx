import "./Card.css";

export default function Card({
  children,
  className = "",
}) {
  return (
    <div
      className={`
        bg-white
        card-hover
        rounded-2xl
        p-6
        shadow-sm
        border
        border-[#edeef3]
        ${className}
      `}
    >
      {children}
    </div>
  );
}