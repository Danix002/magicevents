import { useState } from 'react';
import Button from '../../../components/buttons/Button';
import BinaryRadio from '../../../components/inputs/BinaryCheckbox';
import Input from '../../../components/inputs/Input';
import { useNavigate, useParams } from 'react-router-dom';
import { insertInfo } from '../../../api/gameAPI';
import MysticalBackground from '../../../components/ui/MysticalBackground';
import CrystalBall from '../../../components/ui/CrystalBall';
import MagicalCard from '../../../components/ui/MagicalCard';

const GameForm = () => {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		gameId: eventId,
		isMen: null,
		age: 30,
		isHostFamilyMember: null,
		isHostAssociate: null,
		haveBeard: null,
		isBald: null,
		haveGlasses: null,
		haveDarkHair: null,
		userMagicEventsTag: JSON.parse(sessionStorage.getItem('user')).magicEventTag,
	});

	const handleForm = async (e) => {
		e.preventDefault();
		console.log(formData);

		const res = await insertInfo(formData);
		if (res.ok) {
			navigate(`/${eventId}/game`);
		}
	};

	const handleChange = (name, value) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<MysticalBackground variant="form">
			<div className="min-h-screen flex flex-col items-center justify-center p-4">
				{/* Header */}
				<div className="text-center mb-8">
					<CrystalBall size="medium" className="mb-6">
						<div className="text-4xl">🔮</div>
					</CrystalBall>
					<h1 className="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
						Il Mago delle Predizioni
					</h1>
					<p className="text-purple-200 text-lg md:text-xl max-w-2xl mx-auto">
						Rispondi alle domande mistiche per permettermi di leggere la tua essenza...
					</p>
				</div>

				{/* Form */}
				<MagicalCard variant="form" className="w-full max-w-2xl">
					<form onSubmit={handleForm} className="space-y-6">
						{/* Gender */}
						<MagicalCard variant="question" className="!p-4">
							<BinaryRadio 
								onChange={(v) => handleChange('isMen', v)} 
								question={'Genere:'} 
								labels={['Maschio', 'Femmina']} 
							/>
						</MagicalCard>

						{/* Age */}
						<MagicalCard variant="question" className="!p-4">
							<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
								<h1 className="font-semibold text-purple-200 text-lg">
									Quanti anni hai?
								</h1>
								<Input
									value={formData.age}
									onChange={(e) => handleChange('age', Number(e.target.value))}
									customClassContainer="!min-w-[11rem]"
									name={'età'}
									type="number"
									min={0}
									max={130}
								/>
							</div>
						</MagicalCard>

						{/* Family member */}
						<MagicalCard variant="question" className="!p-4">
							<BinaryRadio
								onChange={(v) => handleChange('isHostFamilyMember', v)}
								question={"Sei un familiare del creatore/i dell'evento?"}
							/>
						</MagicalCard>

						{/* Colleague */}
						<MagicalCard variant="question" className="!p-4">
							<BinaryRadio
								onChange={(v) => handleChange('isHostAssociate', v)}
								question={"Sei un collega di uno dei creatori dell'evento?"}
							/>
						</MagicalCard>

						{/* Physical attributes grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<MagicalCard variant="question" className="!p-4">
								<BinaryRadio onChange={(v) => handleChange('haveBeard', v)} question={'Hai la barba?'} />
							</MagicalCard>

							<MagicalCard variant="question" className="!p-4">
								<BinaryRadio onChange={(v) => handleChange('haveGlasses', v)} question={'Porti gli occhiali?'} />
							</MagicalCard>

							<MagicalCard variant="question" className="!p-4">
								<BinaryRadio onChange={(v) => handleChange('isBald', v)} question={'Sei pelato?'} />
							</MagicalCard>

							<MagicalCard variant="question" className="!p-4">
								<BinaryRadio onChange={(v) => handleChange('haveDarkHair', v)} question={'Hai i capelli scuri?'} />
							</MagicalCard>
						</div>

						{/* Submit button */}
						<div className="pt-6">
							<button
								type="submit"
								className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
										 text-white font-bold py-4 px-8 rounded-2xl transform transition-all duration-300 
										 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 text-lg
										 border border-purple-400/30 backdrop-blur-sm"
							>
								✨ Inizia la Predizione ✨
							</button>
						</div>
					</form>
				</MagicalCard>

				{/* Footer */}
				<div className="mt-8 text-center text-purple-300/80">
					<p className="text-sm">La magia sta per iniziare...</p>
				</div>
			</div>
		</MysticalBackground>
	);
};

export default GameForm;
