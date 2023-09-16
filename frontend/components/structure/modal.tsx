import React from 'react';
import ReactDOM from 'react-dom';
import styles from '@/styles/modal.module.css';

export default function Modal({ onClose, children, title }: { onClose: Function, children: React.ReactNode, title: string | null }) {
	const modalRoot = document.querySelector('#modal-root');
	const modalContent = (
		<div className="modal-overay">
			<div className="modal-wrapper">
				<div className="modal">
					<div className="modal-header">
						<a href="#" onClick={(e) => {e.preventDefault(); onClose()}}>
							x
						</a>
					</div>
					{title && <h1>{title}</h1>}
					<div className="modal-body">
						{children}
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
