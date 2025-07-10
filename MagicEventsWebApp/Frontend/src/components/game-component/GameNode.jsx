import { useEffect, useState } from 'react';
import Button from '../buttons/Button';
import { getUserFromId } from '../../api/authentication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import MagicalCard from '../ui/MagicalCard';
import CrystalBall from '../ui/CrystalBall';

const GameNode = ({ startingNode }) => {
	const [node, setNode] = useState(startingNode);
	const [result, setResult] = useState(null);
	const navigate = useNavigate();
	const { eventId } = useParams();

	useEffect(() => {
		async function fetchAPI() {
			if (!node.rightNode && !node.leftNode) {
				setResult(null);
				const api = await getUserFromId(node.splitFeatureQuestion);
				const json = await api.json();
				setResult(
					<div className="flex flex-row gap-4 items-center">
						<div className="w-20 h-20 rounded-full bg-clip-border">
							<img
								className="rounded-full object-cover h-full w-full object-center"
								src={
									json.profileImageUrl
										? json.profileImageUrl.startsWith('http')
											? json.profileImageUrl.replace(/'+$/, '')
											: 'data:image/*;base64,' + json.profileImageUrl
										: '/default-avatar.png'
								}
								alt="test"
							/>
						</div>
						<div>
								<p className="text-white font-semibold">{json.username}</p>
								<p className="font-light text-sm text-purple-200">{json.name + ' ' + json.surname}</p>
						</div>
					</div>
				);
			}
		}
		fetchAPI();
	}, [node]);

	return node ? (
		<div className="flex z-100 flex-col gap-6 h-full items-center justify-center relative">
			<button
				className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
						 text-white p-3 rounded-lg transform transition-all duration-300 hover:scale-105"
				onClick={() => navigate('/' + eventId)}
			>
				<FontAwesomeIcon icon={faArrowLeft} />
			</button>
			
			{node.leftNode && node.rightNode ? (
				<>
					{!node.leftNode?.leftNode || !node.leftNode?.leftNode?.leftNode ? (
						<MagicalCard variant="default" className="mb-4">
							<div className="flex items-center gap-2">
								<CrystalBall size="small">
									<div className="text-lg animate-pulse-glow">✨</div>
								</CrystalBall>
								<p className="text-purple-200">Ci sono quasi...</p>
							</div>
						</MagicalCard>
					) : null}
					
					<div className="flex flex-row justify-between gap-6 w-full px-4 max-w-4xl">
						<button
							className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600
									 text-white font-bold py-4 px-8 rounded-lg transform transition-all duration-300 
									 hover:scale-105 shadow-lg hover:shadow-xl"
							onClick={() => setNode((prev) => prev.rightNode)}
						>
							SÌ
						</button>
						
						<MagicalCard variant="default" className="flex-1 max-w-md">
							<div className="text-center">
								<CrystalBall size="medium" className="mb-4">
									<div className="text-2xl animate-pulse-glow">🔮</div>
								</CrystalBall>
								<h1 className="text-white text-lg font-semibold">
									{node.splitFeatureQuestion}
								</h1>
							</div>
						</MagicalCard>
						
						<button
							className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600
									 text-white font-bold py-4 px-8 rounded-lg transform transition-all duration-300 
									 hover:scale-105 shadow-lg hover:shadow-xl"
							onClick={() => setNode((prev) => prev.leftNode)}
						>
							NO
						</button>
					</div>
				</>
			) : (
				<div className="text-center space-y-6">
					<MagicalCard variant="default" className="max-w-md">
						{result ? (
							<div className="space-y-4">
								<CrystalBall size="medium" className="mb-4">
									<div className="text-3xl animate-pulse-glow">🎯</div>
								</CrystalBall>
								<p className="text-white text-lg">
									Credo che sia:
								</p>
								<div className="font-bold text-purple-200">
									{result}
								</div>
							</div>
						) : (
							<div className="space-y-4">
								<CrystalBall size="medium" className="mb-4">
									<div className="text-3xl animate-pulse-glow">🔮</div>
								</CrystalBall>
								<p className="text-white">Ci sto pensando...</p>
								<div className="flex justify-center space-x-2">
									{[...Array(3)].map((_, i) => (
										<div
											key={i}
											className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
											style={{ animationDelay: `${i * 0.2}s` }}
										/>
									))}
								</div>
							</div>
						)}
					</MagicalCard>

					<button
						className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
								 text-white font-bold py-3 px-8 rounded-lg transform transition-all duration-300 
								 hover:scale-105 shadow-lg"
						onClick={() => setNode(startingNode)}
					>
						Ricomincia
					</button>
				</div>
			)}
		</div>
	) : (
		<MagicalCard variant="default" className="text-center">
			<div className="space-y-4">
				<CrystalBall size="medium">
					<div className="text-3xl animate-pulse-glow">🔮</div>
				</CrystalBall>
				<p className="text-white">Penso alla possibile risposta...</p>
			</div>
		</MagicalCard>
	);
};

export default GameNode;
