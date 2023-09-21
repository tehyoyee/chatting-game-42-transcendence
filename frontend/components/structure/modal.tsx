import React, { createContext, useContext } from 'react';
import ReactDOM from 'react-dom';
import styles from '@/styles/modal.module.css';
import { CSSRuleObject } from 'tailwindcss/types/config';

/*
 * Modal Component
 * @prop onClose callback function should set modal state as false so that modal disappears by re-render.
 * @prop children content which will be represented inside modal.
 * @prop title(optional) title of modal.
 * @prop style(optional) CSS object to set its style manually.
 */

type ModalContextType = {
	onClose: Function,
};

// TODO: modal close on nickname change confirm
const ModalContext = createContext<ModalContextType | null>(null);

export default function Modal({ 
	onClose, 
	children, 
	id = "modal-root", 
	title = "", 
	style = {} 
}: { 
	onClose: Function, 
	children: React.ReactNode, 
	id?: string, 
	title?: string | null, 
	style?: CSSRuleObject 
}) {
	const modalRoot = document.querySelector(`#${id}`);
	const modalContent = (
		<div className={`${styles.modalOverlay}`}>
			<div 
				className={`${styles.modalWrapper}`}
				style={style}>
				<div className={`${styles.modal}`}>
					<div className={`${styles.modalHeader}`}>
						<a href="#" onClick={(e) => {e.preventDefault(); onClose()}}>
							x
						</a>
					</div>
					{title && <h1>{title}</h1>}
					<div 
						className="modal-body">
						<ModalContext.Provider value={{ onClose }}>
							{children}
						</ModalContext.Provider>
					</div>
				</div>
			</div>
		</div>
	);
  return modalRoot && ReactDOM.createPortal(
		modalContent,
		modalRoot
	);
}
