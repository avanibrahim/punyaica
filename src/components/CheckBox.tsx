import React from "react";

type Props = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  barClassName?: string; // warna garis, default bg-black
};

const Checkbox: React.FC<Props> = ({
  checked,
  defaultChecked,
  onChange,
  barClassName = "bg-black",
}) => {
  return (
    <label className="flex flex-col gap-2 w-8">
      <input
        className="peer hidden"
        type="checkbox"
        {...(checked !== undefined ? { checked } : {})}
        {...(checked === undefined && defaultChecked !== undefined
          ? { defaultChecked }
          : {})}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div
        className={[
          "rounded-2xl h-[3px] w-1/2 duration-500 origin-right",
          barClassName,
          "peer-checked:rotate-[225deg] peer-checked:-translate-x-[12px] peer-checked:-translate-y-[1px]",
        ].join(" ")}
      />
      <div
        className={["rounded-2xl h-[3px] w-full duration-500", barClassName, "peer-checked:-rotate-45"].join(" ")}
      />
      <div
        className={[
          "rounded-2xl h-[3px] w-1/2 duration-500 place-self-end origin-left",
          barClassName,
          "peer-checked:rotate-[225deg] peer-checked:translate-x-[12px] peer-checked:translate-y-[1px]",
        ].join(" ")}
      />
    </label>
  );
};

export default Checkbox;

