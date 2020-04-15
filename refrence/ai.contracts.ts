export interface Bot {
    act: (input: InputContract) => OutputContract;
}

export interface InputContract {
	heroId: number; // The ID of the hero you are controlling
    cooldowns: CooldownsRemaining; // The remaining cooldowns for your hero
    state: World; // The state of the world
	settings: AcolyteFightSettings; // The current settings for this mod - see acolytefight.d.ts
	difficulty: number; // Between 0 (easy) and 1 (hard)
}

export interface OutputContract {
	delayMilliseconds?: number; // Reaction time - number of milliseconds to wait before perform this action. Must be greater than 0.

	// Cast a spell
	spellId?: string;
	target?: Vec2;
	release?: boolean;

	// Change spells
	spells?: KeyBindings;
}

export interface World {
	tick: number;
	started: boolean; // Whether heroes can take damage yet

	heroes: { [id: number]: Hero };
	projectiles: { [id: number]: Projectile };
	obstacles: { [id: number]: Obstacle };

	radius: number; // The current radius of the stage
}

export interface WorldObject {
	id: number;
	pos: Vec2;
	velocity: Vec2;
}

export interface Hero extends WorldObject {
	isBot: boolean; // Is this another bot?
	isSelf: boolean; // Is the hero you are controlling
	isAlly: boolean;
	isEnemy: boolean;
	health: number; // The current health of the hero (out of 100)
	heading: number; // the direction the hero is currently facing, in radians
	radius: number; // The radius of the hero
	inside: boolean; // Whether the unit in inside or outside the confines of the map
	link: LinkState; // If set, this Hero currently has trapped another hero in a link
	casting?: CastingState; // If set, currently casting a channelled spell
	shieldTicksRemaining: number; // The number of ticks that the hero will continue to be shielded for, 0 if unshielded
}

export interface LinkState {
	spellId: string; // The type of link
	targetId: number; // The ID of the other object (e.g. hero or obstacle) currently attached to
}

export interface Projectile extends WorldObject {
	ownerId: number;
	spellId: string;

	radius: number;
}

export interface CastingState {
	spellId: string;
}

export interface CooldownsRemaining {
	[spellId: string]: number;
}

export interface Obstacle extends WorldObject {
	type: string;
}