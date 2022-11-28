import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setMessage } from '../store/slices/calendarsSlice';
import { SERVER_URL } from "../const";
import UpdateProfile from "./UpdateProfile";
import PopUpSure from "../popups/PopUpSure";
import { getSrc, getAvatar } from "../tools/tools_func";

function PopUpProfile({ setIsPopUpOpen }) {
    const curUser = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [isUpdating, setIsUpdating] = useState(false);

    const [isPopUpSureOpen, setIsPopUpSureOpen] = useState(false);
    const [isSure, setIsSure] = useState(false);

    useEffect(() => {
        if (isSure) {
            fetch(SERVER_URL + '/api/users/profile', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': curUser.token
                }
            })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                else {
                    dispatch(removeUser());
                    dispatch(setMessage({ message: "Profile was successfully deleted" }));
                    window.location.href = '/login';
                }
            })
            .catch((err) => {
                console.log('err', err, err.body);
                switch(err.status) {
                    case 401:
                        dispatch(removeUser());
                        window.location.href = '/login';
                        break;
                    default:
                        window.location.href = '/error';
                }
            });
        }
    }, [isSure]);

    return (
        <>
            {
                isPopUpSureOpen &&
                <PopUpSure text={'Do you want to delete profile?'} setIsSure={setIsSure} setIsPopUpOpen={setIsPopUpSureOpen} />
            }
            <div className="popup_background" onClick={() => {setIsPopUpOpen(false)}} />
            <div className="popup_container">
                {
                    isUpdating
                    ? <UpdateProfile setIsUpdating={setIsUpdating} />
                    : <>
                        <div className='icons_container'>
                            <div className='icon' onClick={() => {setIsUpdating(true)}}>
                                <iconify-icon icon="material-symbols:edit"/>
                            </div>
                            <div className='icon' onClick={() => {setIsPopUpSureOpen(true)}}>
                                <iconify-icon icon="material-symbols:delete-rounded"/>
                            </div>
                        </div>
                        <div className='icon close' onClick={() => {setIsPopUpOpen(false)}}>
                            <iconify-icon icon="material-symbols:close" />
                        </div>
                        <div className='user_container'>
                            <div className="user_icon_outer">
                                {
                                    curUser.profilePicture
                                    ? <img src={getSrc(curUser.profilePicture)} alt="avatar" />
                                    : <>
                                        {getAvatar(curUser.fullName)}
                                    </>
                                }
                            </div>
                            <div className='user_info'>
                                <div className='login'>{curUser.login}</div>
                                <div className='status'>{curUser.fullName}</div>
                                <div className='status'>{curUser.email}</div>
                            </div>
                        </div>
                    </>
                }
            </div>
        </>
    );
}

export default PopUpProfile;

