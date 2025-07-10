import { useEffect, useState } from 'react';
import Button from '../buttons/Button';
import { getUserFromId } from '../../api/authentication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';

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
						<div className=" w-20 h-20 rounded-full bg-clip-border ">
							<img
								className=" rounded-full object-cover h-full w-full object-center   "
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
							<p>{json.username}</p>
							<p className=" font-light text-sm ">{json.name + ' ' + json.surname}</p>
						</div>
					</div>
				);
			}
		}
		fetchAPI();
	}, [node]);

	return node ? (
		<div className="flex z-100 flex-col gap-4  h-full items-center justify-center relative">
			<Button
				custom="absolute top-4 left-4"
				onClick={() => navigate('/' + eventId)}
				text={<FontAwesomeIcon icon={faArrowLeft} />}
			></Button>
			{node.leftNode && node.rightNode ? (
				<>
					{!node.leftNode?.leftNode || !node.leftNode?.leftNode?.leftNode ? (
						<p className=" bg-[#363540]/70 text-[#E8F2FC]  backdrop-blur-2xl p-4 rounded-md ">Ci sono quasi</p>
					) : (
						''
					)}
					<div className="flex flex-row justify-between gap-4 w-full px-4">
						<Button
							custom="w-30 !p-4 !bg-[#E8F2FC] !text-[#363540] hover:!shadow-2xl hover:!shadow-[#E8F2FC]"
							onClick={() => setNode((prev) => prev.rightNode)}
							text="SI"
						/>
						<h1 className="bg-[#363540]/70 text-[#E8F2FC] backdrop-blur-2xl p-4 rounded-md">
							{node.splitFeatureQuestion}
						</h1>
						<Button
							custom="w-30 !p-4 !bg-[#E8F2FC] !text-[#363540] hover:!shadow-2xl hover:!shadow-[#E8F2FC]"
							onClick={() => setNode((prev) => prev.leftNode)}
							text="NO"
						/>
					</div>
				</>
			) : (
				<>
					{result ? (
						<p className=" bg-[#363540]/70 text-[#E8F2FC]  backdrop-blur-2xl p-4 rounded-md ">
							Credo che sia: <span className="font-bold">{result}</span>
						</p>
					) : (
						<p className=" bg-[#363540]/70 text-[#E8F2FC]  backdrop-blur-2xl p-4 rounded-md ">Ci sto pensando...</p>
					)}

					<Button onClick={() => setNode(startingNode)} text="Ricomincia" />
				</>
			)}
		</div>
	) : (
		<div className=" bg-[#363540]/70 backdrop-blur-2xl p-4 rounded-md ">Penso alla possibile risposta</div>
	);
};

export default GameNode;
