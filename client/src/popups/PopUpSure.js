import React from 'react';

function PopUpSure({ text, setIsSure, setIsPopUpOpen }) {
    return (
        <>
            <div className="popup_background sure" onClick={() => {setIsPopUpOpen(false)}} />
            <div className="popup_container sure">
                <div className='display_center'>
                    <div>{text}</div>
                    <div onClick={() => {setIsSure(true); setIsPopUpOpen(false);}}>
                        Yes
                    </div>
                    <div onClick={() => {setIsPopUpOpen(false)}}>No</div>
                </div>
            </div>
        </>
    );
}

export default PopUpSure;

