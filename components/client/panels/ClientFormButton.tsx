import FormButton, {
  FormButtonProps,
} from "@/components/server/panels/FormButton";

type ClientFormButtonProps = {
  onClick: () => void;
} & FormButtonProps;

export default function ClientFormButton({
  className,
  text,
  tooltip,
  onClick,
}: ClientFormButtonProps) {
  return (
    <div onClick={onClick} className={className}>
      <FormButton text={text} tooltip={tooltip} />
    </div>
  );
}
