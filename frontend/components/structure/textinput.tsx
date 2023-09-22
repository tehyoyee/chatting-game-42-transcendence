import { FormEventHandler, ReactNode } from 'react';

export default function TextInputForm({
	children,
	onSubmit,
	label = '',
	pattern = '',
	tailMassage = '',
	id = 'inputField',
}: {
	children: ReactNode,
	onSubmit: Function,
	label?: string,
	pattern?: string,
	tailMassage?: string,
	id?: string,
}) {
	return (
	<form
		onSubmit={(e) => {
			e.preventDefault();
			onSubmit();
		}}>
		{children}
{/* htmlFor value must match with querySelector argument in onSubmit callback */}
		<label htmlFor="inputField">{label}</label>
		<input
			style={{
				margin: '0.5rem',
				border: 'solid 1px',
				width: '14rem',
			}}
			type="text"
			id={`${id}`}
			pattern={pattern}
			onInvalid={() => {console.log("invalid")}}
			required
		/>
		<button
			className="normalButton"
			type="submit">
			확인
		</button>
		<p>
			{tailMassage}
		</p>
	</form>
	);
}
