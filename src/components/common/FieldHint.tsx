interface FieldHintProps {
  text: string;
}

export const FieldHint = ({ text }: FieldHintProps) => {
  return <p className="small-hint mt-1">i: {text}</p>;
};
