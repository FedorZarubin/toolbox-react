import "../css/modal.css"

function Modal ({title, description, content, closeFunc}) {

    return (
        <div className="modalShadow" onClick={(e)=>{if (closeFunc) {closeFunc()}}}>
            <div className="modal" onClick={(e)=>{e.stopPropagation()}}>
                <div className="modalHeader">{title}</div>
                {description && <div className="modalDescription">{description}</div>}
                <div className="modalContent">
                    {content}
                </div>
            </div>
        </div>
    );
}

export { Modal } ;