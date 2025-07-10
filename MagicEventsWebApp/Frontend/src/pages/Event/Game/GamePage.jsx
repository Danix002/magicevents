import { useState } from 'react';
import GameNode from '../../../components/game-component/GameNode';
import { useEffect } from 'react';
import { getGame, isDataInGame } from '../../../api/gameAPI';
import { useNavigate, useParams } from 'react-router-dom';
import MysticalBackground from '../../../components/ui/MysticalBackground';
import CrystalBall from '../../../components/ui/CrystalBall';
import MagicalCard from '../../../components/ui/MagicalCard';

const GamePage = () => {
	const { eventId } = useParams();
	const navigate = useNavigate();

	const [tree, setTree] = useState(null);
	const [error, setError] = useState('');

	useEffect(() => {
		async function fetchAPI() {
			try {
				const isInGameAPI = await isDataInGame(eventId);
				const res1 = await isInGameAPI.json();

				if (!res1) {
					navigate(`/${eventId}/game/form`);
					return;
				}

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
	}, [eventId, navigate]);

	const LoadingState = () => (
		<div className="min-h-screen flex flex-col items-center justify-center p-4">
			<CrystalBall size="large" className="mb-8">
				<div className="text-6xl animate-pulse-glow">🔮</div>
			</CrystalBall>
			
			<MagicalCard variant="default" className="text-center max-w-md">
				<div className="space-y-4">
					<h2 className="text-2xl font-bold text-white">Il Mago sta Pensando...</h2>
					<div className="flex justify-center space-x-2">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
								style={{ animationDelay: `${i * 0.2}s` }}
							/>
						))}
					</div>
					<p className="text-purple-200">
						Sto preparando le domande mistiche per te...
					</p>
				</div>
			</MagicalCard>
		</div>
	);

	const ErrorState = ({ message }) => (
		<div className="min-h-screen flex flex-col items-center justify-center p-4">
			<CrystalBall size="large" className="mb-8">
				<div className="text-6xl">🌩️</div>
			</CrystalBall>
			
			<MagicalCard variant="default" className="text-center max-w-md">
				<div className="space-y-4">
					<h2 className="text-2xl font-bold text-red-300">Errore Mistico</h2>
					<p className="text-red-200">{message}</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 
								 text-white font-bold py-2 px-6 rounded-lg transform transition-all duration-300 
								 hover:scale-105"
					>
						Riprova
					</button>
				</div>
			</MagicalCard>
		</div>
	);

	const GameWrapper = ({ children }) => (
		<div className="min-h-screen flex flex-col">
			{/* Header */}
			<div className="text-center py-6 px-4">
				<CrystalBall size="medium" className="mb-4">
					<div className="text-4xl animate-pulse-glow">🔮</div>
				</CrystalBall>
				<h1 className="text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
					Il Mago delle Predizioni
				</h1>
				<p className="text-purple-200 mt-2">
					Rispondo alle tue domande per svelare il mistero...
				</p>
			</div>
			
			{/* Game Content */}
			<div className="flex-1 flex items-center justify-center p-4">
				<div className="w-full max-w-4xl">
					{children}
				</div>
			</div>
		</div>
	);

	return (
		<MysticalBackground variant="game">
			{tree ? (
				<GameWrapper>
					<GameNode startingNode={tree} />
				</GameWrapper>
			) : error ? (
				<ErrorState message={error} />
			) : (
				<LoadingState />
			)}
		</MysticalBackground>
	);
};

export default GamePage;
