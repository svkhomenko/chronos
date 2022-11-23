import React from 'react';

function PopUpSure({ text, setIsSure, setIsPopUpOpen }) {
    return (
        <>
            <div className="popup_background sure" onClick={() => {setIsPopUpOpen(false)}} />
            <div className="popup_container sure">
                <div className='icon close' onClick={() => {setIsPopUpOpen(false)}}>
                    <iconify-icon icon="material-symbols:close" />
                </div>
                <div className='sure_text'>{text}</div>
                <div className='sure_buttons_container'>
                    <div className='button' onClick={() => {setIsSure(true); setIsPopUpOpen(false);}}>
                        Yes
                   </div>
                    <div className='button negative' onClick={() => {setIsPopUpOpen(false)}}>
                        No
                    </div>
                </div>
            </div>
        </>
    );
}

export default PopUpSure;

