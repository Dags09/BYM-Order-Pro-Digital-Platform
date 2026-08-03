import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export type ShowPwField = "current" | "newPw" | "confirm";

interface EyeBtnProps {
    field: ShowPwField;
    visible: boolean;
    onToggle: (field: ShowPwField) => void;
}

const EyeBtn = ({ field, visible, onToggle }: EyeBtnProps) => (
    <button
        type="button"
        onClick={() => onToggle(field)}
        className="text-slate-300 hover:text-slate-500 transition"
    >
        <FontAwesomeIcon
            icon={visible ? faEyeSlash : faEye}
            className="text-xs"
        />
    </button>
);

export { EyeBtn };
