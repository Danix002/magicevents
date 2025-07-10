import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {updatePartecipants} from "../../api/eventAPI";

const AddPartecipantPage = () => {
    const { eventId, idOfWhoGenerated } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const dynamicAdd = async () => {
            const userString = sessionStorage.getItem("user");
            if (userString) {
                const user = JSON.parse(userString);
                try {
                    const emailList = [user.email];
                    await updatePartecipants(eventId, emailList, idOfWhoGenerated);
                    navigate(`/${eventId}`, { replace: true });
                } catch (err) {
                    console.log(err.message);
                }
            } else {
                sessionStorage.setItem('fromAfterLogin', `/${eventId}/${idOfWhoGenerated}/addpartecipant`);
                navigate("/login", { replace: true });
            }
        };
        dynamicAdd();
    }, [eventId, idOfWhoGenerated, navigate]);

};

export default AddPartecipantPage;
