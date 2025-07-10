import { useState } from 'react';
import GameNode from '../../../components/gameComponents/GameNode';
import { useEffect } from 'react';
import { getGame, isDataInGame } from '../../../api/gameAPI';
import { useNavigate, useParams } from 'react-router-dom';

const GamePage = () => {
	const { eventId } = useParams();
	const navigate = useNavigate();

	const [tree, setTree] = useState(null);
	const [error, setError] = useState('');

	useEffect(() => {
		async function fetchAPI() {
			const isInGameAPI = await isDataInGame(eventId);
			const res1 = await isInGameAPI.json();

			if (!res1) {
				navigate(`/${eventId}/game/form`);
				return;
			}

			try {
				const res = await getGame(eventId);
				const res2 = await res.json();
				setTree(res2.root);
			} catch (error) {
				setError('Non sono del umore, riprova più tardi');
			}
		}

		if (!eventId) {
			return;
		}

		fetchAPI();
	}, [eventId]);

	return (
		<div className="h-full overflow-y-auto bg-gradient-to-r from-[#EE0E51]  to-[#E4DCEF] relative   ">
			<div className=" gameBackground  w-full h-full">
				{tree ? (
					<GameNode startingNode={tree} />
				) : error ? (
					<p className="text-[#E8F2FC] p-4 w-fit m-4 text-center bg-[#505458] rounded-md backdrop-blur-3xl ">{error}</p>
				) : (
					<p className="text-[#E8F2FC] p-4 w-fit m-4 text-center bg-[#505458] rounded-md backdrop-blur-3xl ">
						Aspetta sto pensando alle domande...
					</p>
				)}
			</div>
		</div>
	);
};

export default GamePage;
