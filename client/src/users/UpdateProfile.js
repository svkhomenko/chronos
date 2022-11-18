import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, removeUser } from '../store/slices/userSlice';
import { setMessage } from '../store/slices/calendarsSlice';
import { SERVER_URL, CLIENT_URL } from "../const";
import { validateLogin, validateFullName, validateEmail } from "../tools/dataValidation";
import { getSrc } from "../tools/tools_func";

function UpdateProfile({ setIsUpdating }) {
    const curUser = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [login, setLogin] = useState(curUser.login);
    const [email, setEmail] = useState(curUser.email);
    const [fullName, setFullName] = useState(curUser.fullName);
    const [curAvatar, setCurAvatar] = useState(curUser.profilePicture);
    const [profilePicture, setProfilePicture] = useState(null);

    const [loginMessage, setLoginMessage] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [fullNameMessage, setFullNameMessage] = useState('');
    const [profilePictureMessage, setProfilePictureMessage] = useState('');

    return (
        <div className='display_center'>
            <div className={'post_card update_post user_form no_hr'}> 
                <h2>Update profile</h2>
                <form onSubmit={handleSubmit}>
                    <div className='label'>Login:</div>
                    <div className='message error'>{loginMessage}</div>
                    <input type="text" value={login} onChange={handleChangeLogin} className="input" />

                    <div className='label'>Email:</div>
                    <div className='message error'>{emailMessage}</div>
                    <input type="text" value={email} onChange={handleChangeEmail} className="input" />

                    <div className='label'>Full name:</div>
                    <div className='message error'>{fullNameMessage}</div>
                    <input type="text" value={fullName} onChange={handleChangeFullName} className="input" />

                    <div>
                        <div className='label'>Avatar:</div>
                        {
                            curAvatar 
                            && <div className="user_icon_outer post_images_outer update" >
                                <img src={getSrc(curAvatar)} alt="avatar" />
                                <div onClick={handleChangeDeleteAvatar} className="delete_image">
                                    <iconify-icon icon="iwwa:delete" />
                                </div>
                            </div>
                        }
                        <div className='message error'>{profilePictureMessage}</div>
                        <label htmlFor="file-upload_update_user" className='button negative file_upload_label'>
                            Upload Files
                        </label>
                        <input type="file" id="file-upload_update_user" accept="image/*"
                                onChange={handleChangeProfilePicture} className="input_file" />
                        {
                            profilePicture &&
                            <div className='upload_files_container'>
                                {profilePicture.name}{' - '}{(profilePicture.size / 1024).toFixed(2)}{' KB'}
                            </div>
                        }
                    </div>
                    <input type="submit" value="Update profile" className='button submit' />
                </form>
            </div>
        </div>
    );
    
    function handleChangeLogin(event) {
        setLogin(event.target.value);
    }

    function handleChangeEmail(event) {
        setEmail(event.target.value);
    }

    function handleChangeFullName(event) {
        setFullName(event.target.value);
    }

    function handleChangeProfilePicture(event) {
        setProfilePicture(event.target.files[0]);
    }
    
    function handleChangeDeleteAvatar(event) {
        event.preventDefault();
        setCurAvatar(false);
    }
    
    function handleSubmit(event) {
        event.preventDefault();

        setLoginMessage('');
        setEmailMessage('');
        setFullNameMessage('');
        setProfilePictureMessage('');

        if (isDataValid()) {
            let isEmailChanged = email !== curUser.email;

            let formData = new FormData();

            formData.append("login", login);
            formData.append("email", email);
            formData.append("fullName", fullName);
            if (!curAvatar) {
                formData.append("deleteAvatar", true);
            }
            if (profilePicture) {
                formData.append("avatar", profilePicture);
            }
            formData.append("link", CLIENT_URL + '/email-confirmation');
            
            fetch(SERVER_URL + '/api/users/profile', {
                method: 'PATCH',
                headers: {
                    'authorization': curUser.token
                },
                body: formData
            })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                else {
                    dispatch(setMessage({ message: "Profile was successfully updated" }));
                    if (isEmailChanged) {
                        dispatch(removeUser());
                        window.location.href = '/login';
                    }
                    else {
                        return response.json();
                    }
                }
            })
            .then((data) => {
                dispatch(setUser({
                    id: data.id,
                    login: data.login,
                    email: data.email,
                    fullName: data.fullName,
                    profilePicture: data.profilePicture,
                    status: data.status,
                    token: curUser.token
                }));
                setIsUpdating(false);
            })
            .catch((err) => {
                console.log('err', err, err.body);
                switch(err.status) {
                    case 400:
                        return err.json();
                    case 401:
                    case 403:
                    case 404:
                        dispatch(removeUser());
                        window.location.href = '/login';
                        break;
                    default:
                        window.location.href = '/error';
                }
            })
            .then((err) => {
                if (err && err.message) {
                    console.log(err.message);
                    if (/email/i.test(err.message)) {
                        setEmailMessage(err.message);
                    }
                    else if (err.message.includes('Full name')) {
                        setFullNameMessage(err.message);
                    }
                    else if (/login/i.test(err.message)) {
                        setLoginMessage(err.message);
                    }
                    else {
                        window.location.href = '/error';
                    }
                }
            });
        }
    }

    function isDataValid() {
        let validData = true;

        validData = validateLogin(login, setLoginMessage) && validData;
        validData = validateFullName(fullName, setFullNameMessage) && validData;
        validData = validateEmail(email, setEmailMessage) && validData;

        if (profilePicture && profilePicture[0] && !profilePicture[0].type.startsWith("image")) {
            setProfilePictureMessage("Upload files in an image format");
            validData = false;
        }

        return validData;
    }
}

export default UpdateProfile;

