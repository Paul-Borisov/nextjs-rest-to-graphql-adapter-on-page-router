import { Button, Tooltip } from "@radix-ui/themes";

export type FormButtonProps = {
  className?: string;
  text: string;
  tooltip?: string;
};

const FormButton = ({ className, text, tooltip }: FormButtonProps) => {
  return (
    <Button
      className={[
        "!w-32 !h-10 !font-semibold !bg-blue-500 hover:!bg-blue-700 !text-white !rounded !cursor-pointer",
        className,
      ]
        .join(" ")
        .trim()}
    >
      {tooltip ? (
        <Tooltip content={tooltip}>
          <span>{text}</span>
        </Tooltip>
      ) : (
        text
      )}
    </Button>
  );
};

export default FormButton;
