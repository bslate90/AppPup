import { useState } from 'react';
import {
    AlertTriangle,
    Phone,
    ChevronDown,
    Heart,
    Skull,
    Bug,
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    Info,
    Shield
} from 'lucide-react';

// Emergency Reference Data
const emergencyCategories = [
    {
        id: 'immediate',
        title: 'Life-Threatening Emergencies',
        subtitle: 'Call your vet IMMEDIATELY',
        icon: <AlertTriangle className="w-6 h-6" />,
        gradient: 'from-red-500 via-red-600 to-rose-700',
        glow: 'shadow-red-500/40',
        items: [
            {
                icon: '🚨',
                title: 'Collapse / Unconsciousness',
                symptoms: ['Sudden collapse', 'Not responding', 'Limp body', 'Glazed eyes'],
                actions: ['Keep airway clear', 'Check for breathing', 'Keep warm with blanket', 'Transport to vet IMMEDIATELY'],
                doNot: ['Give food or water', 'Shake the puppy', 'Wait to see if it improves'],
                urgency: 'critical'
            },
            {
                icon: '⚡',
                title: 'Seizures',
                symptoms: ['Uncontrolled shaking', 'Stiff legs', 'Drooling', 'Loss of consciousness', 'Paddling legs'],
                actions: ['Clear area of objects', 'Time the seizure', 'Keep hands away from mouth', 'Call vet if seizure lasts >2 min'],
                doNot: ['Restrain the puppy', 'Put anything in mouth', 'Try to hold tongue'],
                urgency: 'critical'
            },
            {
                icon: '😤',
                title: 'Difficulty Breathing',
                symptoms: ['Gasping', 'Blue/purple gums', 'Extended neck', 'Loud breathing', 'Flared nostrils'],
                actions: ['Keep calm and quiet', 'Check for obstructions', 'Keep airway open', 'Immediate vet transport'],
                doNot: ['Give food or water', 'Lay on back', 'Wait to see if it improves'],
                urgency: 'critical'
            },
            {
                icon: '🩸',
                title: 'Severe Bleeding',
                symptoms: ['Blood pooling', 'Spurting blood', 'Pale gums', 'Weakness'],
                actions: ['Apply firm pressure', 'Use clean cloth/gauze', 'Elevate if possible', 'Get to vet immediately'],
                doNot: ['Remove cloth if soaked (add more)', 'Use tourniquet unless trained', 'Clean wound first'],
                urgency: 'critical'
            },
            {
                icon: '🎈',
                title: 'Bloat (Gastric Dilatation)',
                symptoms: ['Swollen/hard belly', 'Retching without vomiting', 'Restlessness', 'Excessive drooling'],
                actions: ['DO NOT wait—this is fatal within hours', 'No food or water', 'Keep puppy calm', 'Emergency vet NOW'],
                doNot: ['Try to relieve gas yourself', 'Give any medications', 'Wait to see if it passes'],
                urgency: 'critical'
            },
        ]
    },
    {
        id: 'poisoning',
        title: 'Poisoning & Toxicity',
        subtitle: 'Call ASPCA Poison Control: (888) 426-4435',
        icon: <Skull className="w-6 h-6" />,
        gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
        glow: 'shadow-violet-500/40',
        items: [
            {
                icon: '🍫',
                title: 'Chocolate Poisoning',
                symptoms: ['Vomiting', 'Diarrhea', 'Rapid breathing', 'Hyperactivity', 'Seizures'],
                actions: ['Note type and amount eaten', 'Call poison control', 'Induce vomiting ONLY if instructed', 'Bring packaging to vet'],
                doNot: ['Wait for symptoms', 'Induce vomiting without guidance', 'Give milk'],
                urgency: 'high',
                info: 'Dark chocolate and baking chocolate are most dangerous. 1 oz of baking chocolate can be lethal to a 10 lb dog.'
            },
            {
                icon: '🍇',
                title: 'Grapes/Raisins',
                symptoms: ['Vomiting', 'Lethargy', 'Decreased urination', 'Abdominal pain'],
                actions: ['Call vet immediately', 'Note quantity eaten', 'Induce vomiting if <2 hours'],
                doNot: ['Wait for symptoms—kidney failure can occur within 24-72 hrs'],
                urgency: 'high',
                info: 'Even small amounts can cause acute kidney failure. There is no known safe dose.'
            },
            {
                icon: '💊',
                title: 'Xylitol (Sugar-Free Sweetener)',
                symptoms: ['Vomiting', 'Weakness', 'Collapse', 'Seizures', 'Liver failure'],
                actions: ['Emergency vet immediately', 'Bring product packaging', 'Note time and amount'],
                doNot: ['Wait—xylitol is extremely fast-acting', 'Induce vomiting without vet guidance'],
                urgency: 'critical',
                info: 'Found in sugar-free gum, candy, peanut butter, toothpaste. Can cause fatal liver failure within 12-24 hrs.'
            },
            {
                icon: '🧅',
                title: 'Onions/Garlic',
                symptoms: ['Weakness', 'Vomiting', 'Breathlessness', 'Pale gums', 'Red/brown urine'],
                actions: ['Calculate amount eaten', 'Call vet or poison control', 'Monitor for signs'],
                doNot: ['Assume small amounts are safe—toxicity is cumulative'],
                urgency: 'moderate',
                info: 'Toxic dose is 15-30g per kg body weight. Effects may not appear for 3-5 days.'
            },
            {
                icon: '💐',
                title: 'Toxic Plants',
                symptoms: ['Drooling', 'Vomiting', 'Diarrhea', 'Difficulty breathing', 'Collapse'],
                actions: ['Identify the plant', 'Take photo or sample', 'Call poison control', 'Get to vet with plant ID'],
                doNot: ['Induce vomiting for caustic plants', 'Wait if breathing is affected'],
                urgency: 'varies',
                info: 'Most toxic: Lilies, Sago Palm, Azaleas, Oleander, Tulip bulbs, Autumn Crocus'
            },
        ]
    },
    {
        id: 'medical',
        title: 'Medical Emergencies',
        subtitle: 'Urgent vet care needed',
        icon: <Heart className="w-6 h-6" />,
        gradient: 'from-amber-500 via-orange-500 to-red-600',
        glow: 'shadow-amber-500/40',
        items: [
            {
                icon: '🍼',
                title: 'Hypoglycemia (Low Blood Sugar)',
                symptoms: ['Weakness', 'Trembling', 'Disorientation', 'Glazed eyes', 'Seizures'],
                actions: ['Rub Karo syrup or honey on gums', 'Keep warm', 'Feed small meal when responsive', 'Call vet'],
                doNot: ['Force-feed if unconscious', 'Give large amounts of sugar'],
                urgency: 'high',
                info: 'Most common in toy breed puppies under 12 weeks. Can be fatal within hours if untreated.'
            },
            {
                icon: '🔥',
                title: 'Heatstroke',
                symptoms: ['Heavy panting', 'Drooling', 'Red gums', 'Vomiting', 'Collapse', 'Temp >104°F'],
                actions: ['Move to shade/AC immediately', 'Apply cool (not cold) water', 'Wet paws and ears', 'Offer water to drink', 'Get to vet'],
                doNot: ['Use ice or ice-cold water', 'Cover with wet towels', 'Force water'],
                urgency: 'critical',
                info: 'Brain damage begins at 106°F. Can be fatal within 15 minutes. NEVER leave in car.'
            },
            {
                icon: '❄️',
                title: 'Hypothermia',
                symptoms: ['Shivering (then stops)', 'Lethargy', 'Weak pulse', 'Shallow breathing', 'Temp <99°F'],
                actions: ['Bring indoors', 'Wrap in warm blankets', 'Use body heat', 'Warm water bottles (wrapped)', 'Call vet'],
                doNot: ['Use direct heat (heating pad)', 'Put in hot bath', 'Rub or massage'],
                urgency: 'high',
                info: 'Toy breeds are extremely susceptible. Core body temp below 95°F is critical.'
            },
            {
                icon: '💧',
                title: 'Severe Dehydration',
                symptoms: ['Dry gums', 'Sunken eyes', 'Skin tenting', 'Lethargy', 'No urination'],
                actions: ['Offer small amounts of water frequently', 'Check gum color and CRT', 'Get to vet for IV fluids'],
                doNot: ['Force large amounts of water', 'Give Gatorade or milk'],
                urgency: 'high',
                info: 'Do the skin tent test: pinch skin on back—if it doesn\'t snap back immediately, puppy is dehydrated.'
            },
            {
                icon: '💩',
                title: 'Bloody Diarrhea/Vomiting',
                symptoms: ['Blood in stool or vomit', 'Lethargy', 'Loss of appetite', 'Dehydration'],
                actions: ['Collect sample if possible', 'Note frequency and amount', 'Withhold food', 'Get to vet TODAY'],
                doNot: ['Wait more than 12 hours', 'Give over-the-counter meds', 'Feed regular food'],
                urgency: 'high',
                info: 'Can indicate parvo, parasites, foreign body, or other serious conditions.'
            },
            {
                icon: '🦴',
                title: 'Broken Bone/Severe Injury',
                symptoms: ['Limping', 'Swelling', 'Crying when touched', 'Visible deformity', 'Won\'t bear weight'],
                actions: ['Keep puppy still', 'Support the injured area', 'Muzzle if in pain (they may bite)', 'Transport carefully to vet'],
                doNot: ['Try to set the bone', 'Give human pain meds', 'Let puppy walk on it'],
                urgency: 'high'
            },
        ]
    },
    {
        id: 'exposure',
        title: 'Environmental Hazards',
        subtitle: 'Check your environment',
        icon: <Bug className="w-6 h-6" />,
        gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
        glow: 'shadow-emerald-500/40',
        items: [
            {
                icon: '🐝',
                title: 'Bee/Wasp Stings',
                symptoms: ['Swelling at site', 'Pawing at face', 'Hives', 'Difficulty breathing (allergic)'],
                actions: ['Scrape out stinger (don\'t squeeze)', 'Apply ice pack', 'Monitor for allergic reaction', 'Call vet if swelling spreads'],
                doNot: ['Use tweezers to remove stinger', 'Give human antihistamines without vet approval'],
                urgency: 'low-high',
                info: 'Allergic reactions can escalate quickly. If breathing is affected, this is a CRITICAL emergency.'
            },
            {
                icon: '🐍',
                title: 'Snake Bite',
                symptoms: ['Two puncture wounds', 'Rapid swelling', 'Pain', 'Weakness', 'Vomiting'],
                actions: ['Keep puppy calm and still', 'Carry (don\'t let walk)', 'Get to vet ASAP', 'Try to identify snake (photo)'],
                doNot: ['Cut the wound', 'Try to suck out venom', 'Apply ice or tourniquet'],
                urgency: 'critical'
            },
            {
                icon: '🧪',
                title: 'Chemical Burns',
                symptoms: ['Redness', 'Blistering', 'Excessive licking', 'Crying'],
                actions: ['Flush with water for 15-20 min', 'Prevent licking (cone)', 'Identify the chemical', 'Get to vet'],
                doNot: ['Apply neutralizing agents', 'Use ointments without vet guidance'],
                urgency: 'high'
            },
            {
                icon: '⚡',
                title: 'Electrical Shock',
                symptoms: ['Burns on mouth/lips', 'Difficulty breathing', 'Collapse', 'Seizures'],
                actions: ['Turn off power source first!', 'Check breathing and heart', 'Keep warm', 'Emergency vet'],
                doNot: ['Touch puppy while still connected to power', 'Assume puppy is fine if seems okay'],
                urgency: 'critical',
                info: 'Internal damage may not be visible. Always have checked by vet even if puppy seems okay.'
            },
        ]
    },
];

const emergencyContacts = [
    { name: 'ASPCA Poison Control', number: '(888) 426-4435', note: '$75 consultation fee' },
    { name: 'Pet Poison Helpline', number: '(855) 764-7661', note: '$85 consultation fee' },
];

export function EmergencyGuide() {
    const [expandedCategory, setExpandedCategory] = useState<string | null>('immediate');
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            {/* Emergency Header */}
            <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 via-orange-500/20 to-amber-500/10" />
                <div className="absolute inset-0 backdrop-blur-3xl" />
                <div className="absolute top-4 right-4 w-20 h-20 bg-red-400/30 rounded-full blur-2xl animate-pulse" />

                <div className="relative glass-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-rose-700 flex items-center justify-center text-white shadow-2xl shadow-red-500/40 ring-4 ring-red-500/20">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                                Emergency Reference
                            </h2>
                            <p className="text-sm font-medium text-[var(--text-secondary)]">
                                Quick Guide for Puppy Emergencies
                            </p>
                        </div>
                    </div>

                    {/* Emergency Contact Buttons */}
                    <div className="grid grid-cols-1 gap-2 mt-4">
                        {emergencyContacts.map((contact) => (
                            <a
                                key={contact.name}
                                href={`tel:${contact.number.replace(/[^0-9]/g, '')}`}
                                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 hover:border-red-500/40 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-[var(--text-primary)] text-sm">{contact.name}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{contact.note}</p>
                                </div>
                                <span className="font-bold text-red-600 dark:text-red-400 group-hover:underline">
                                    {contact.number}
                                </span>
                            </a>
                        ))}
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            <strong className="text-amber-600 dark:text-amber-400">⚠️ Important:</strong> Save your local emergency vet's number in your phone NOW.
                            Know their location before an emergency happens.
                        </p>
                    </div>
                </div>
            </div>

            {/* Emergency Categories */}
            {emergencyCategories.map((category) => (
                <div key={category.id} className="glass-card-interactive overflow-hidden">
                    <button
                        className="w-full text-left p-5 transition-all duration-300"
                        onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.gradient} text-white flex items-center justify-center shadow-xl ${category.glow} ring-4 ring-white/10`}>
                                {category.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[var(--text-primary)] text-lg leading-tight">
                                    {category.title}
                                </h3>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
                                    {category.subtitle}
                                </p>
                            </div>
                            <div className={`text-[var(--text-muted)] transition-transform duration-300 ${expandedCategory === category.id ? 'rotate-180' : 'rotate-0'}`}>
                                <ChevronDown className="w-5 h-5" />
                            </div>
                        </div>
                    </button>

                    {expandedCategory === category.id && (
                        <div className="px-5 pb-5 pt-0 animate-slide-down space-y-3">
                            {category.items.map((item) => (
                                <div key={item.title} className="glass-panel overflow-hidden">
                                    <button
                                        className="w-full text-left p-4 transition-all"
                                        onClick={() => setExpandedItem(expandedItem === item.title ? null : item.title)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{item.icon}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-[var(--text-primary)] text-sm">{item.title}</h4>
                                                    {item.urgency === 'critical' && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">CRITICAL</span>
                                                    )}
                                                    {item.urgency === 'high' && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">URGENT</span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronDown
                                                className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-300 ${expandedItem === item.title ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                    </button>

                                    {expandedItem === item.title && (
                                        <div className="px-4 pb-4 space-y-3 animate-slide-down">
                                            {/* Info box if present */}
                                            {item.info && (
                                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                                    <div className="flex gap-2">
                                                        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                                        <p className="text-xs text-[var(--text-secondary)]">{item.info}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Symptoms */}
                                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Symptoms
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.symptoms.map((symptom, idx) => (
                                                        <span key={idx} className="px-2 py-1 rounded-lg text-[10px] bg-white/50 dark:bg-slate-800/50 text-[var(--text-secondary)] border border-amber-500/20">
                                                            {symptom}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    What To Do
                                                </p>
                                                <ol className="space-y-1">
                                                    {item.actions.map((action, idx) => (
                                                        <li key={idx} className="text-xs text-[var(--text-secondary)] flex gap-2">
                                                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center flex-shrink-0 font-bold">
                                                                {idx + 1}
                                                            </span>
                                                            {action}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>

                                            {/* Do NOT */}
                                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                                <p className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" />
                                                    Do NOT
                                                </p>
                                                <ul className="space-y-1">
                                                    {item.doNot.map((dont, idx) => (
                                                        <li key={idx} className="text-xs text-[var(--text-secondary)] flex gap-2">
                                                            <span className="text-red-500">✕</span>
                                                            {dont}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {/* Quick Reference Card */}
            <div className="glass-card p-5 bg-gradient-to-r from-slate-500/5 to-gray-500/5 border border-slate-500/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white shadow-lg">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-[var(--text-primary)]">When to Seek Immediate Care</h4>
                        <p className="text-xs text-[var(--text-muted)]">Don't wait if you see these signs</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {[
                        'Difficulty breathing',
                        'Collapse or unresponsive',
                        'Seizures lasting >2 min',
                        'Severe bleeding',
                        'Unable to urinate',
                        'Bloated/hard abdomen',
                        'Pale or blue gums',
                        'Suspected poisoning',
                    ].map((sign, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                            <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                            <span className="text-[11px] text-[var(--text-secondary)]">{sign}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Disclaimer */}
            <div className="glass-card bg-[var(--bg-muted)]/30 border border-[var(--border-color)] p-5">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                        <Shield className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        <strong className="text-red-500">Emergency Disclaimer:</strong> This guide is for reference only and does NOT replace professional veterinary care.
                        When in doubt, always call your veterinarian or emergency animal hospital. Time is critical in emergencies—
                        don't delay seeking professional help.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default EmergencyGuide;
