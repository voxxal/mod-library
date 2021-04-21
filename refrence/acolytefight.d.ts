/*

Units - general conventions:
* Distance: If you're on a horizontal monitor, the distance from the top of the screen to the bottom is 1.0.
* Time: Either ticks or seconds. There are 60 ticks per second.
* Speed: Distance per second.
* Angles: Revolutions. e.g. maxAngleDiff: 0.25 means the spell can be cast when the acolyte is one quarter-turn away from facing the target directly.
* Angular speeds: Revolutions per second.
* Health: Percentages. Heroes start with 100.
* Lifesteal: Fraction of damage translated into lifesteal. e.g. 1.0 for drain, 0.5 for link.
* Densities, forces, impulses: These are a bit arbitrary and don't really have units. Heroes have a density of 0.5 and everything has been set relative to that.

The collision and alliance flags are bitmasks: https://en.wikipedia.org/wiki/Mask_(computing)

Collision category flags (categories, expireOn and collideWith):
* All = 0xFFFF
* Hero = 0x1
* Projectile = 0x2
* Massive = 0x4
* Obstacle = 0x8
* Shield = 0x10
* Blocker = 0x20 // all projectiles except Fireball/Fireboom are solid
* None = 0

Alliance flags (against, expireAgainstHeroes, expireAgainstObjects):
* Self = 0x01
* Ally = 0x02
* Enemy = 0x04
* Neutral = 0x08

Graphics level:
* Maximum = 5; // Retina displays
* Ultra = 4; // Blooms
* High = 3; // Particles
* Medium = 2; // Lights and shadows
* Low = 1;
* Minimum = 0.5; // Low-res

*/

declare interface AcolyteFightSettings {
	Mod: ModSettings;
	Matchmaking: MatchmakingSettings;
	Layouts: Layouts;
    Hero: HeroSettings;
    World: WorldSettings;
	Obstacle: ObstacleSettings;
	ObstacleTemplates: ObstacleTemplateLookup;
    Spells: Spells;
	Choices: ChoiceSettings;
	Sounds: Sounds;
	Visuals: VisualSettings;
	Audio: AudioSettings;
	Icons: IconLookup;
	Tips: Tip[];
	Code: string;
}

declare type ModTree = {
	[K in keyof AcolyteFightSettings]?: any;
}

declare interface ModSettings {
	name: string;
	author: string;
	description: string;

	titleLeft: string; // On the homepage, this text flies in from left
	titleRight: string; // On the homepage, this text flies in from right

	subtitleLeft: string;
	subtitleRight: string;

	private: boolean; // If true, other players in a party will be unable to see the contents of the mod
}

declare interface TipDetail {
	isMobile?: boolean;
	tip: string;
}
declare type Tip = string | TipDetail;

declare interface HeroSettings {
	MoveSpeedPerSecond: number;
	MaxSpeed: number; // Limit speed - corrects some physics engine errors which can speed up the hero and eject them from the map uncontrollably
    Radius: number;
    Density: number;

    AngularDamping: number;
	Damping: number; // How quickly knockback decayed. Higher number, faster decay.
	
	DamageMitigationTicks: number; // Within these many ticks, damage does not stack between multiple players
	LifeStealMitigationPerOpponent: number; // If 2+ people have hit me recently, increase my lifesteal by this amount per opponent
	CooldownMitigationPerOpponent: number; // If 2+ people have hit me recently, speed up my cooldown by this amount per opponent
	MaxMitigationBonuses: number; // Maximum number of mitigation bonuses to apply

	MaxCooldownWaitTicks: number; // If cast a spell and it is almost finished cooling down within this time, just wait to cast it
	ThrottleTicks: number; // Within these many ticks, disallow multiple spells to be cast by the same hero

    MaxHealth: number;
    SeparationImpulsePerTick: number; // The force which stops heroes going inside each other

	RevolutionsPerTick: number; // Hero turn rate
}

declare interface WorldSettings {
	InitialRadius: number; // Initial radius of the world
	HeroLayoutProportion: number; // The radius at which to place heroes - 1 means edge of map, 0 means at center
	HeroResetProportion: number; // When starting the game, of a hero is outside the map, reset it to this proportion

	LavaLifestealProportion?: number; // Deprecated, use LavaDamage instead
	LavaDamagePerSecond?: number; // Deprecated, use LavaDamage instead

	LavaDamageInterval: number; // Ticks between applying lava damage
	LavaDamage: DamagePacketTemplate; // Apply this damage every interval the acolyte is in the void
	LavaBuffs: BuffTemplate[]; // Apply these buffs whenever an acolyte touches the void

	SecondsToShrink: number;
	ShrinkPowerMinPlayers: number; // Make the shrinking non-linear. Higher values mean faster shrinking at the start of the game.
	ShrinkPowerMaxPlayers: number;
	ShrinkCatchupProportionPerTick: number; // As players leave, shrink faster to catch up to what the map size would've been if we had started with fewer players

	MaxLifeSteal: number; // A single hit can never do more than this much lifesteal, no matter how many lifesteal buffs it has
	
	ProjectileSpeedDecayFactorPerTick: number; // If a projectile is going faster or slower than its intended speed, correct it by this proportion per tick

	SwatchHealth: number; // How quickly does a swatch (e.g. a boost pad) die in the void?

	SlopSpeed: number; // Performance improvement: When performing speed adjustments, if the speed is within this value consider it equal
	SlopRadius: number; // Performance improvement: For detonate, sabers, auras, attracts, etc to collide correctly, no object must be larger than this radius.

	SwapDistanceReduction: number; // When a swap detonate is cast, everything within the AOE is moved to the new location except is brought closer by this factor

	BotName: string; // What to call the bot
	DefaultGameStartMessage: string;

	Layouts?: string[]; // Only allow this subset of layouts to be played. Used internally to preview a single map.
}

declare interface MatchmakingSettings {
	MaxPlayers: number; // Maximum number of players in one game

	MinBots: number; // minimum number of bots to add when Play vs AI clicked
	MaxBots: number; // maximum number of bots to add when Play vs AI clicked
	NumGamesToMaxBotDifficulty: number; // How many games does the person need to play until the bot reaches maximum difficulty

	EnableSingles: boolean; // Try to keep the match together with no teams
	EnableSplitting: boolean; // Try to split the match into two or more matches of similar skill levels
	EnableTeams: boolean; // Try to group the match into teams

	TeamsMinGames: number; // Only create teams if all players have played at least this many games
	PvE: boolean; // Only create human vs bot teams
	AllowBotTeams: boolean; // Allow teams even when bots are in the game
	AllowUnevenTeams: boolean; // Create teams even when there is not an even number of players
	BotRating: number; // If the bot is being matched into teams, consider it to be a player with this rating

	RatingPower: number; // Higher means the matchmaker will try harder to match players of similar skill and there will be less random variation

	OddPenalty: number; // Discourage non-even splits by this proportion
	SmallPenalty: number; // Discourage small games by this proportion
	SamePenalty: number; // Discourage identical consecutive matchups by this proportion
	TeamPenaltyPower: number; // Discourage teams of unbalanced skill (e.g. newbies and GMs) with this power
}

declare interface Layouts {
    [name: string]: Layout;
}

declare interface Layout {
	startMessage?: string; // Message to display on game start

	color?: string; // Color of the map
	background?: string; // Color of the void
	obstacles: ObstacleLayout[];
	numPoints?: number; // Number of points to this layout, defaults to zero (circle)
	angleOffsetInRevs?: number; // Rotate the map by this angle, defaults to zero
	radiusMultiplier?: number; // Change the radius of the world by this proportion, defaults to 1.0
}

declare interface ObstacleShapeTemplate {
	// Properties
	type?: string;
	health?: number;

	// Layout
	layoutRadius: number;

	// Individual obstacle
	numPoints?: number; // Make this a rotationally-symmetric polygon, otherwise make this an arc
	extent: number; // aka radius but for a polygon
	angularWidthInRevs?: number; // For trapezoid or arcs
}

declare interface ObstacleLayout extends ObstacleShapeTemplate {
	// Layout
	numObstacles: number;
	layoutAngleOffsetInRevs?: number;
	pattern?: number[];

	// Individual obstacle
	orientationAngleOffsetInRevs?: number; // Rotate the shape
}

declare type SwatchRender =
	SwatchFill
	| SwatchBloom
	| SwatchSmoke

declare interface SwatchColor {
	color: string;
	deadColor?: string;
	flash?: boolean; // Whether to flash when obstacle hit. Defaults to true.
	tint?: number; // Add this proportion of the map color to the obstacle color
}

declare interface SwatchFill extends SwatchColor {
	type: "solid";

	expand?: number;
	glow?: number;
	bloom?: number;
	gradient?: number; // Between 0 and 1, how much shading to apply
	shadow?: boolean; // Apply shadow offset and shadow feather to fill
	light?: number;
}

declare interface SwatchBloom extends SwatchColor {
	type: "bloom";

	glow?: number;
	bloom?: number
	strikeOnly?: boolean;
	light?: number;
}

declare interface SwatchSmoke {
	type: "smoke";

	color: string;
	particleRadius: number;

	light?: number;
	colorize?: number;
	shine?: number;
	fade?: string;
	glow?: number;
	bloom?: number;
	vanish?: number;
	shadow?: number;

	ticks: number;
	interval?: number;
	speed: number;
	conveyor?: number; // 1 means move at the same speed as the conveyor, 0.5 means half speed, etc
}

declare interface ObstacleSettings {
	AngularDamping: number;
	LinearDamping: number;
	Density: number;

	// These values control how quickly obstacles return to their initial positions before the game starts
	ReturnProportion: number;
	ReturnMinSpeed: number;
	ReturnTurnRate: number;
}

declare interface ObstacleTemplateLookup {
	[key: string]: ObstacleTemplate;
}

declare interface ObstacleTemplate {
	render?: SwatchRender[];
	strike?: RenderStrikeParams;
	sound?: string;

	static?: boolean; // Whether this obstacle is movable
	angularDamping?: number;
	linearDamping?: number;
	density?: number;

	sensor?: boolean; // Whether other objects (e.g. projectiles) pass through this obstacle
	collideWith?: number;
	expireOn?: number;
	undamageable?: boolean; // Whether projectiles or detonations can damage this obstacle
	circularHitbox?: boolean; // For physics, ignore the shape of the polygon, just it a circular hitbox so it is easier to predict how it will move

	health: number;

	hitInterval?: number; // How many ticks between reapplying the buffs
	damage?: number;
	selfDamage?: number; // Touching the obstacle causes it to lose health
	decayPerSecond?: number; // This obstacle will naturally lose this much health per second
	buffs?: BuffTemplate[];
	detonate?: DetonateParametersTemplate;
	mirror?: boolean;
	impulse?: number;
	conveyor?: ConveyorParameters;
}

declare interface ConveyorParameters {
	radialSpeed?: number;
	lateralSpeed?: number;
}

declare interface ChoiceSettings {
	Keys: KeyConfig[];
	Options: KeyBindingOptions;
	Special: KeyBindings;
}

declare interface KeyConfig {
	btn: string;
	barSize?: number;
	wheelSize?: number;
}

declare interface Spells {
    [key: string]: Spell;
}

declare type Spell =
	MoveSpell
	| StopSpell
	| RetargetSpell
	| BuffSpell
	| ChargingSpell
	| ProjectileSpell
	| ReflectSpell
	| FocusSpell
	| SaberSpell
	| SpraySpell
	| ScourgeSpell
	| TeleportSpell
	| ThrustSpell
	| WallSpell

declare interface SpellBase {
	id: string;
	name?: string;
	description: string;
	effects?: EffectInfo[]; // Only used for display purposes

	action: string; // Which action function to use
	sound?: string; // Which sound to use for charging/channelling
	untargeted?: boolean; // No target required. i.e. cast instantly when you click the button
	passive?: boolean; // Apply the buffs immediately
	movementCancel?: boolean; // Moving will interrupt this spell

	maxAngleDiffInRevs?: number; // How much does the acolyte have to turn to face the target?

	unlink?: boolean; // When this spell is cast, remove any links which I own
	debuff?: boolean; // When this spell is cast, remove all buffs
	throttle?: boolean; // Don't allow throttled spells to be cast too quickly
	chargeTicks?: number; // The number of ticks of charge-up time before casting the spell
	release?: ReleaseParams; // If set, the spell will track the release of the button. Behaviour depends on the type of spell.
	movementProportionWhileCharging?: number; // Proportion of movement to allow during the charge-up time
	movementProportionWhileChannelling?: number; // Proportion of movement to allow during the channelling of the spell
	revsPerTickWhileCharging?: number; // If set, defines how quickly the hero can orient themselves towards the cursor while charging
	revsPerTickWhileChannelling?: number; // If set, defines how quickly the hero can orient themselves towards the cursor while channelling
	cooldown: number;
	voidCooldownMultiplier?: number; // Cooldown ticks at this rate while in the void
	interruptibleAfterTicks?: number; // Cannot interrupt a spell until it has been channeling for at least this length
	interruptCancel?: SpellCancelParams; // If the spell is cancelled by the caster, apply this cooldown
	strikeCancel?: StrikeCancelParams; // If this spell is being channelled, whether being hit by something cancels it.
	
	chargeBuffs?: BuffTemplate[]; // Apply these buffs at the start of charging the spell
	buffs?: BuffTemplate[]; // Apply these buffs at the start of channelling the spell

    icon?: string;

	color: string; // The colour of the button for this spell (not the projectile)
	glow?: number; // 0 means no glow, 1 means full glow around acolyte when casting
}

declare interface EffectInfo {
	icon: string; // Font awesome or RPG awesome class: see https://fontawesome.com/icons or https://nagoshiashumari.github.io/Rpg-Awesome/
	title: string;
	text: string;
}

declare interface ReleaseParams {
	maxChargeTicks?: number; // Don't finish charging until button is released or until this number of ticks
	interrupt?: boolean; // Whether releasing the button interrupts the spell
	interruptibleAfterTicks?: number; // Cannot interrupt a spell until it has been channeling for at least this length
}

declare interface SpellCancelParams {
	cooldownTicks?: number; // If cancelled by knockback, set cooldown to this value. This can be used to allow the spell to be re-cast quickly if interrupted.
	maxChannelingTicks?: number; // Only apply the cooldown reset if have been channelling for less than this time.
}

declare interface StrikeCancelParams extends SpellCancelParams, ColliderTemplate {
}

declare interface MoveSpell extends SpellBase {
	action: "move";
	cancelChanneling: boolean;
}

declare interface StopSpell extends SpellBase {
    action: "stop";
}

declare interface RetargetSpell extends SpellBase {
    action: "retarget";
}

declare interface ProjectileSpell extends SpellBase {
    action: "projectile";

	projectile: ProjectileTemplate;
	recoil?: number;
}

declare interface SpraySpell extends SpellBase {
    action: "spray";

	projectile: ProjectileTemplate;

	maxChannellingTicks?: number; // Keep channelling until this many ticks has been reached

	numProjectilesPerTick?: number; // Number of projectiles to shoot per tick. Defaults to 1.
    intervalTicks: number; // Spray shoots a new projectile every intervalTicks
    lengthTicks: number; // Spray continues creating new projectiles until lengthTicks has passed
	jitterRatio: number; // The spread of the spray. 1.0 means it should go out to 90 degrees either side. Weird units, I know.

	recoil?: number;
}

declare interface ChargingSpell extends SpellBase {
    action: "charge";

	projectile: ProjectileTemplate;
	retarget?: boolean; // If the charging takes a while, use the player's latest cursor position as the target, not the initial cursor position

	chargeDamage?: PartialDamageParameters; // Scale damage with charge time
	chargeRadius?: PartialDamageParameters; // Scale projectile radius with charge time
	chargeImpulse?: PartialDamageParameters; // Scale detonation knockback with charge time

	recoil?: number;
}

declare interface FocusSpell extends SpellBase {
	action: "focus";
	
	projectile: ProjectileTemplate;

	releaseAfterTicks?: number; // Cannot release until this many ticks have passed
	focusDelaysCooldown?: boolean; // Whether to delay the cooldown until focusing is complete
	releaseBehaviours?: BehaviourTemplate[]; // Add these behaviours to the projectile when button is released. Must also specify the release property so the UI sends the release signal.
	maxChannellingTicks?: number; // Keep channelling until this many ticks has been reached

	recoil?: number;
}

declare interface ProjectileTemplate extends DamagePacketTemplate {
	damage: number;

	partialDamage?: PartialDamageParameters; // Scale damage over time
	partialDetonateRadius?: PartialDamageParameters; // Scale detonate radius over time, only useful if detonate set
	partialDetonateImpulse?: PartialDamageParameters; // Scale detonate impulse over time, only useful if detonate set
	partialBuffDuration?: PartialDamageParameters; // Scale buff durations over time, only useful if buffs set

	ccd?: boolean; // Performance improvement: Whether to apply continuous collision detection to this projectile. Small and fast projectiles will tunnel through other objects unless CCD is on. Defaults to true.
	density: number;
	radius: number;
	square?: boolean; // A square projectile will push things directly backwards, not to the side

	speed: number;
	fixedSpeed?: boolean; // if true or undefined, the projectile's speed will be corrected according to ProjectileSpeedDecayFactorPerTick if it becomes faster or slower due to collisions
	speedDecayPerTick?: number; // if set, the projectile's speed will be corrected according to this proportion per tick if it becomes faster or slower due to collisions
	speedDamping?: number; // Controls how quickly the projectile loses speed (does not work if the projectile speeds itself back up again using fixedSpeed or speedDecayPerTick)

	restitution?: number; // 1 means very bouncy, 0 means not bouncy

	attractable?: AttractableTemplate; // Whether the "attract" behaviour (e.g. a whirlwind) can affect this projectile
	swappable?: boolean; // Whether this projectile can be swapped with
	bumpable?: boolean; // Whether this projectile gets knocked back by a bumper obstacle
	conveyable?: boolean; // Whether this projectile is moved by a conveyor belt. (Collision flags must allow the projectile collide with obstacles to work.)
	linkable?: boolean; // Whether a link can attach to this projectile
	destroying?: boolean; // Whether to destroy any projectiles marked as destructible on contact

	hitInterval?: number; // If set, the projectile is allowed to hit enemies multiple times, as long as the ticks between hits is at least this number
    bounce?: BounceParameters;
	link?: LinkParameters;
	horcrux?: HorcruxParameters;
	detonate?: DetonateParametersTemplate;
	gravity?: GravityParameters; // Trap a hero
	swapWith?: number; // Category flags of what types of objects to swap with
	lifeSteal?: number; // 1.0 means all damage is returned as health to the owner of the projectile

	projectileBuffs?: BuffTemplate[]; // Apply these buffs to the owner as long as the projectile is alive
	buffs?: BuffTemplate[]; // Apply these buffs to whatever the projectile hits
	behaviours?: BehaviourTemplate[],

	minTicks?: number; // The minimum number of ticks that a projectile will live for. The main purpose of this is to work around a quirk in the physics engine where if projectiles doesn't live for more than 1 tick, it doesn't affect the physics.
	maxTicks: number; // The maximum number of ticks that a projectile will live for. The maximum range can be determined by speed * maxTicks / TicksPerSecond.
	categories?: number; // Collision flags: What flags this object has
	collideWith?: number; // Collision flags: Which other objects to collide with
	expireOn?: number; // Collision flags: The projectile will expire if it hits any of these objects
	expireAgainstHeroes?: number; // Alliance flags: Whether to expire against enemies only, etc
	expireAgainstObjects?: number; // Alliance flags: Whether to expire against enemies only, etc
	expireOnMirror?: boolean; // Whether to hit mirrors or not
	sensor?: boolean; // A sensor will just pass through all objects and report what it would have collided with
	sense?: number; // Collision flags: Detect when we pass over these objects - different from sensor in that the object can still collide with some things while sensing others
	selfPassthrough?: boolean; // Whether the projectile just passes through its owner
	destructible?: DestructibleParameters; // Whether this projectile is destroyed by a detonate (like a Supernova)
	expireAfterCursorTicks?: number; // Expire this many ticks after the cursor is reached
	shieldTakesOwnership?: boolean; // If the projectile hits a shield, does it switch owner?

	color: string;
	renderers: RenderParams[]; // Which render function to use
	sound?: string;
	soundHit?: string;
}

declare type AttractableTemplate = boolean | AttractableParameters;

declare interface AttractableParameters {
	ignoreAlliance?: boolean;
}

declare interface DestructibleParameters {
	against?: number; // who can destroy this projectile?
}

declare interface PartialDamageParameters {
	initialMultiplier: number; // Initially, the projectile initially does this multiplier
	finalMultiplier?: number;
	afterTicks?: number; // Only start increasing damage after this many ticks
	ticks: number; // The projectile grows to full damage when it reaches this lifetime
	step?: boolean; // Grow from initial to full damage at ticks in one step, rather than linear growth
}

declare interface GravityParameters {
	ticks: number; // How long the trap lasts for
	impulsePerTick: number; // Force to apply each tick to a trapped hero (pre-scaling)
	radius: number; // Scale factor: The force scales to zero at this radius
	power: number; // Scale factor: The power curve to apply to the scaling
	render?: RenderSwirl; // What to render when a hero is caught in gravity
}

declare interface BounceParameters {
	cleanseable?: boolean; // If the target player casts a cleanse (like teleport), stop bouncing towards them
}

declare interface HorcruxParameters {
}

declare type BehaviourTemplate =
	SpawnTemplate
	| HomingTemplate
	| AccelerateTemplate
	| AttractTemplate
	| AuraTemplate
	| StrafeTemplate
	| UpdateCollideWithTemplate
	| UpdatePartialTemplate
	| ClearHitsTemplate
	| ExpireTemplate
	| ExpireOnOwnerDeathTemplate
	| ExpireOnOwnerRetreatTemplate
	| ExpireOnChannellingEndTemplate

declare type HomingType =
	"self" // Home towards the owner (e.g. for self-orbiting projectiles)
	| "enemy" // Home towards the enemy
	| "cursor" // Home towards where the user initially clicked when they shot this projectile
	| "follow" // Home towards where the user's mouse is right now
	| "release" // Home towards position of cursor when button was released

declare interface BehaviourTemplateBase {
	type: string;
	trigger?: BehaviourTrigger;
}

declare interface BehaviourTrigger extends ColliderTemplate {
	afterTicks?: number; // After this many ticks
	atCursor?: boolean; // When projectile reaches cursor
	minTicks?: number; // Don't trigger at cursor until this many ticks have passed

	expire?: boolean; // Trigger on projectile expiry
}

declare interface ColliderTemplate {
	afterTicks?: number; // Trigger collider after this many ticks
	collideWith?: number; // Collision flags. Trigger behaviour when projectile collides with these objects.
	against?: number; // Only consider collisions against these alliance flags.

	collideTypes?: string[]; // Limit to collisions with these projectile spell ids, obstacle types or shield types
	notCollideTypes?: string[]; // Don't trigger when colliding with these types

	detonate?: boolean; // Trigger if caught in a detonation, defaults to true
	notMirror?: boolean; // Don't trigger on mirrors
	notLinked?: boolean; // Don't trigger if I own a link connected to the object I just hit
}

declare interface SpawnTemplate extends BehaviourTemplateBase {
	type: "spawn";

	projectile: ProjectileTemplate;

	numProjectiles?: number; // defaults to 1
	spread?: number; // the angular width to spread the spawned projectiles across, in revs, defaults to 0

	requireParent?: boolean; // Whether the parent projectile must still exist for the spawning to occur, defaults to false
	expire?: boolean; // Whether to expire the parent projectile as well
}

declare interface HomingTemplate extends BehaviourTemplateBase {
	type: "homing";

	targetType?: HomingType; // Whether to home towards "self", "enemy", "cursor" or "follow". Defaults to "enemy".

	revolutionsPerSecond?: number; // The maximum turn rate of the homing projectile. Actually this is revolutionsPerTick but is named wrong. Defaults to infinity
	maxTurnProportion?: number; // The turn rate cannot be more than this proportion of the difference between ideal and current angle. Used to make homing spells dodgeable.
	expireWithinRevs?: number; // Stop homing once within this many revs of aiming directly at the target

	minDistanceToTarget?: number; // Homing is only applied if the projectile is further than this. Used to keep projectiles orbiting at a particular distance.
	maxDistanceToTarget?: number; // Homing is only applied if the projectile is closer than this.

	newSpeed?: number; // Update the speed of the projectile while we're redirecting it.
	speedDecayPerTick?: number; // If set, overwrite the speedDecayPerTick setting on the projectile, which causes it to gradually revert to its original speed if sped up/slowed down by something (e.g. a collision).
	maxTicks?: number; // Only perform homing for this many ticks
	redirect?: boolean; // If true, this homing will only redirect the projectile one time
}

declare interface AccelerateTemplate extends BehaviourTemplateBase {
	type: "accelerate";

	maxSpeed: number;
	accelerationPerSecond: number; // Add this amount to the projectile speed every second
}

declare interface AttractTemplate extends BehaviourTemplateBase {
	type: "attract";

	against?: number; // Which alliances to attract
	collideLike: number; // Only attract other objects which would collide with this. e.g. collide with them like we're a hero
	categories: number; // What types of objects to attract
	notCategories?: number; // What types of objects to not attract
	radius: number; // Maximum range of attraction
	accelerationPerTick: number; // Acceleration per tick
	maxSpeed?: number; // Cannot push an object faster than this
	clampSpeed?: number; // Reduce an object's speed to this (no matter how much force it takes, even if it is greater than accelerationPerTick)
}

declare interface AuraTemplate extends BehaviourTemplateBase {
	type: "aura";

	against?: number;
	radius: number; // Maximum range of aura
	tickInterval: number; // Interval between when to apply the buff
	maxHits?: number;
	packet?: DamagePacketTemplate;
	buffs: BuffTemplate[]; // Buffs to apply
}

declare interface StrafeTemplate extends BehaviourTemplateBase {
	// Make this projectile follow the movements of its owner
	type: "strafe";
	maxSpeed?: number; // Cannot follow faster than this speed
}

declare interface UpdateCollideWithTemplate extends BehaviourTemplateBase {
	type: "updateCollideWith";

	collideWith: number;
}

declare interface ClearHitsTemplate extends BehaviourTemplateBase {
	type: "clearHits";
}

declare interface UpdatePartialTemplate extends BehaviourTemplateBase {
	type: "partial";

	partialDamage?: PartialDamageParameters;
	partialDetonateRadius?: PartialDamageParameters;
	partialDetonateImpulse?: PartialDamageParameters;
	partialBuffDuration?: PartialDamageParameters;
}

declare interface ExpireTemplate extends BehaviourTemplateBase {
	type: "expire";
}
declare interface ExpireOnOwnerDeathTemplate extends BehaviourTemplateBase {
	type: "expireOnOwnerDeath";
}
declare interface ExpireOnOwnerRetreatTemplate extends BehaviourTemplateBase {
	type: "expireOnOwnerRetreat";
	maxDistance: number;
}
declare interface ExpireOnChannellingEndTemplate extends BehaviourTemplateBase {
	type: "expireOnChannellingEnd";
}

declare interface DetonateParametersTemplate extends DamagePacketTemplate {
	against?: number; // Alliance flags

	radius: number; // The radius of the explosion
	
	minImpulse: number; // The outer rim of the explosion will cause this much knockback
	maxImpulse: number; // The epicenter of the explosion will cause this much knockback

	renderTicks: number; // Length of explosion
	sound?: string;

	buffs?: BuffTemplate[];
	swapWith?: number;
}

declare type RenderParams =
	RenderRay
	| RenderProjectile
	| RenderPolygon
	| RenderSwirl
	| RenderLink
	| RenderReticule
	| RenderStrike
	| RenderBloom

declare interface RenderParamsBase {
	type: string;
	minTicks?: number; // Only use this renderer if the projectile has existed for this many ticks
	maxTicks?: number; // Only use this renderer until the projectile has existed for this many ticks
	minGraphics?: number; // Only use this renderer if the grahpics level is greater than or equal to this level
	maxGraphics?: number; // Only use this renderer if the grahpics level is less than or equal to this level
}

declare interface ProjectileColorParams {
    color?: string; // Override the color of the projectile
	selfColor?: boolean; // Give the projectile the owner's colour, so they can tell it's theirs
	ownerColor?: boolean; // Whether to color the same as the owner for other people
}

declare interface RenderRay extends RenderParamsBase, ProjectileColorParams {
	type: "ray";
	intermediatePoints?: boolean; // A ray might be so fast that we need to render the subtick that it made contact, otherwise it doesn't look like it touched the other object at all

	ticks: number; // How long is the trail?
	light?: number; // Render additively
	glow?: number; // How much alpha to apply to the bloom
	bloom?: number; // How much radius to give the bloom
	colorize?: number; // Add a bit of random color (between 0 and 1)
	shine?: number; // Lighten the trail initially
	fade?: string; // Fade towards this color
	vanish?: number; // Fade away the trail until it is transparent - 1 means fade it all away, 0 means do nothing
	shadow?: number; // Render a shadow beneath the ray with this strength (between 0 and 1)
	noPartialRadius?: boolean;
	radiusMultiplier?: number;
}

declare interface RenderProjectile extends RenderParamsBase, ProjectileColorParams {
	type: "projectile";

	ticks: number; // How long is the trail?
	light?: number; // Render additively
	fade?: string;
	vanish?: number;
	smoke?: RenderSmoke;
	glow?: number;
	bloom?: number;
	colorize?: number;
	shine?: number;
	shadow?: number;
	noPartialRadius?: boolean;
	radiusMultiplier?: number;

	intermediateInterpolations?: number; // Render at this many intermediate points as well - fill in the gaps of very fast projectiles
}

declare interface RenderPolygon extends RenderParamsBase, ProjectileColorParams {
	type: "polygon";

	numPoints: number;
	ticks: number;
	revolutionInterval: number;
	light?: number; // Render additively
	fade?: string;
	vanish?: number;
	smoke?: RenderSmoke;
	glow?: number;
	bloom?: number;
	colorize?: number;
	shine?: number;
	shadow?: number;
	noPartialRadius?: boolean;
	radiusMultiplier?: number;
}

declare interface RenderSwirl extends RenderParamsBase {
	type: "swirl";
	radius: number;
	color: string;
	selfColor?: boolean;
	ticks: number; // How long is the trail?

	loopTicks: number; // How long for the swirl to do one full rotation?

	numParticles: number;
	particleRadius: number;

	light?: number; // Render additively
	colorize?: number;
	shine?: number;
	smoke?: RenderSmoke;
	fade?: string;
	vanish?: number;
	glow?: number;
	bloom?: number;
	shadow?: number;
}

declare interface RenderLink extends RenderParamsBase, ProjectileColorParams {
	type: "link";
	color: string;
	width: number;
	light?: boolean; // Render additively
	toWidth?: number;
	colorize?: number;
	shine?: number;
	glow?: number;
	bloom?: number;
	strike?: RenderStrikeParams;
	shadow?: number;
}

declare interface RenderReticule extends RenderParamsBase {
	type: "reticule";
	color: string;
	remainingTicks?: number; // Only display when this many ticks remaining
	shrinkTicks?: number;
	light?: boolean;
	grow?: boolean;
	colorize?: number;
	shine?: number;
	fade?: boolean;
	startingTicks?: number; // Only display for this many ticks since creation of the projectile
	repeat?: boolean; // Whether to repeatedly show the reticule shrinking
	minRadius: number;
	radius: number;
	usePartialDamageMultiplier?: boolean;
	glow?: number;
	bloom?: number;
	shadow?: number;
}

declare interface RenderStrike extends RenderParamsBase, ProjectileColorParams, RenderStrikeParams {
	type: "strike";
	ticks: number;

	detonate?: number; // Render an explosion of this radius on hit
	light?: number; // Render additively
	numParticles?: number;
	particleShine?: number;
	particleColorize?: number;
	particleGlow?: number;
	particleBloom?: number;
	particleVanish?: number;
	particleShadow?: number;
	speedMultiplier?: number;
}

declare interface RenderStrikeParams {
	ticks?: number;
	flash?: boolean;
	growth?: number;
	bloom?: number;
}

declare interface RenderBloom extends RenderParamsBase, ProjectileColorParams {
	type: "bloom";
	light?: number;
	colorize?: number;
	shine?: number;
	glow?: number;
	radius?: number;
}

declare type RenderSmoke = number | RenderSmokeConfig;

declare interface RenderSmokeConfig {
	axisMultiplier?: number; // Follow direction of movement with this multiplier
	isotropicSpeed?: number; // Smoke in all directions at this speed
}

declare type BuffTemplate =
	DebuffTemplate
	| MovementBuffTemplate
	| GlideTemplate
	| VanishTemplate
	| LifestealTemplate
	| SetCooldownTemplate
	| BurnTemplate
	| ArmorTemplate
	| MassTemplate
	| BumpTemplate
	| DelinkTemplate

declare interface BuffTemplateBase {
	type: string;

	stack?: string; // If there is another buff with the same stack name as this, replace it, don't add another buff
	maxStacks?: number; // Cannot have more than this many stacks. Defaults to 1.

	owner?: boolean; // If this is a projectile that hit, apply the buff to the owner, not to the target
	cleansable?: boolean; // Whether this buff can be cleansed, defaults to true

	collideWith?: number; // Only apply the buff if projectile hit this object
	against?: number; // Which alliances to apply this buff to
	maxTicks?: number; // Maximum duration of this buff

	channelling?: boolean; // Cancel this buff if the hero stops casting the spell
	channellingProjectile?: boolean; // Cancel this buff if the projectile it is attached to stops existing
	linkOwner?: boolean; // Cancel this buff if no longer the owner of a link
	linkVictim?: boolean; // Cancel this buff if no longer the victim of a link
	cancelOnHit?: boolean; // Cancel this buff if the hero gets hit
	cancelOnBump?: boolean; // Cancel this buff if the hero bumps another
	passive?: boolean; // Cancel this buff if the hero stops choosing this spell
	resetOnGameStart?: boolean; // Cancel this buff when the game starts

	renderStart?: RenderBuff; // Render some particles when the buff starts
	render?: RenderBuff; // Render particles for the duration of the buff
	renderFinish?: RenderBuff; // Render some particles when the buff ends
	sound?: string;
}

declare interface RenderBuff {
	numParticles?: number;
	invisible?: boolean; // Only show this to players who can see the hero
	color: string;
	selfColor?: boolean; // If the buff belongs to me, view it in my own color
	alpha?: number; // Semi-transparent
	light?: number; // Render additively
	colorize?: number;
	shine?: number; // Brighter initially
	glow?: number; // How much alpha to apply to the bloom
	bloom?: number; // Bloom radius
	bloomLow?: number; // Bloom radius when on low graphics
	fade?: string; // Decay to this color
	smoke?: RenderSmokeConfig; // Move smoke trail
	shadow?: number; // Shadow under trail with this strength (between 0-1)
	vanish?: number; // Decay to transparent
	heroColor?: boolean;
	decay?: boolean;
	emissionRadiusFactor?: number; // 1 means smoke comes from the edges of the hero, 0 means it comes from the center
	particleRadius: number;
	ticks: number;
}

declare interface DebuffTemplate extends BuffTemplateBase {
	type: "debuff"; // Cleanse the receiver of this buff
}

declare interface MovementBuffTemplate extends BuffTemplateBase {
	type: "movement";
	movementProportion: number; // 0 will make the hero unable to move, 2 will make hero movement twice as fast
	decay?: boolean;
}

declare interface GlideTemplate extends BuffTemplateBase {
	type: "glide";
	linearDampingMultiplier: number; // 0 will make the hero glide
}

declare interface VanishTemplate extends BuffTemplateBase {
	type: "vanish";
	noTargetingIndicator?: boolean;
	noBuffs?: boolean;
}

declare interface LifestealTemplate extends BuffTemplateBase { // Does more than lifesteal now...
	type: "lifeSteal";
	damageMultiplier?: number;
	lifeSteal?: number;
	minHealth?: number; // Don't leave the enemy with less health than this. For example, don't kill an enemy.
	decay?: boolean; // The damage multiplier linearly decays over time.

	source?: string; // Only affect damage packets with the same source
}

declare interface SetCooldownTemplate extends BuffTemplateBase {
	type: "cooldown";
	spellId?: string;
	spellIds?: string[];
	notSpellIds?: string[];
	minCooldown?: number;
	maxCooldown?: number;
	adjustCooldown?: number; // Add or subtract cooldown
	cooldownRateModifier?: number; // Positive for faster, negative for slower
	color?: string;
}

declare interface BurnTemplate extends BuffTemplateBase {
	type: "burn";
	hitInterval: number;
	packet: DamagePacketTemplate;
}

declare interface ArmorTemplate extends BuffTemplateBase {
	type: "armor";
	proportion: number; // Positive increases damage received, negative negates damage received
	minHealth?: number; // Don't allow damage received to take us below this amount of health

	source?: string; // Only affect damage packets with the same source
}

declare interface MassTemplate extends BuffTemplateBase {
	type: "mass";
	radius: number; // Increase the radius of the hero to this value
	appendCollideWith?: number; // Expand what the hero can collide with while this buff is active - e.g. collide with shields
	restrictCollideWith?: number; // Restrict what the hero can collide with while this buff is active
	sense?: number; // Don't physically collide with these objects, but perform all other collision effects
	density?: number; // Increase the density of the hero by amount
}

declare interface BumpTemplate extends BuffTemplateBase {
	type: "bump";
	impulse: number;
	hitInterval: number;
}

declare interface DelinkTemplate extends BuffTemplateBase {
	type: "delink";
}

declare interface BuffSpell extends SpellBase {
    action: "buff";

	buffs: BuffTemplate[];
	maxChannellingTicks?: number; // Keep channelling until this many ticks has been reached

	projectileInterval?: number;
	projectile?: ProjectileTemplate;
}

declare interface ScourgeSpell extends SpellBase {
    action: "scourge";

	selfDamage: number;
	minSelfHealth: number;

	detonate: DetonateParametersTemplate;

    trailTicks: number;
}

declare interface ShieldSpell extends SpellBase {
	maxTicks: number;
	takesOwnership: boolean;
	damageMultiplier: number;
	blocksTeleporters: boolean;
	light?: number;
	glow?: number;
	bloom?: number;
	shine?: number;
	colorize?: number;
	shadow?: number;
}

declare interface ReflectSpell extends ShieldSpell {
	action: "shield";

	categories?: number;
	minRadius?: number;
	strokeRadius?: number;
	radius: number;
	growthTicks?: number; // Shield grows to full size over this many ticks

	angularWidthInRevs?: number;
	numPoints?: number;
	maxTurnRatePerTickInRevs?: number;

	angularDamping?: number;
	density?: number;
	ropeLength?: number; // If set, knockback that is applied to the shield will apply to the acolyte, but only if it knocks back the acolyte by at least this much

	strike?: RenderStrikeParams;
}

declare interface WallSpell extends ShieldSpell {
	action: "wall";

	maxRange: number;

	length: number;
	width: number;

	growthTicks: number;
	maxTicks: number;

	conveyable?: boolean; // The wall is affected by conveyor belts
	bumpable?: boolean; // The wall is affected by bumpers
	swappable?: boolean; // Swap affects the wall
	density?: number; // If set, the wall is moveable
	ccd?: boolean; // Performance improvement: Whether to apply continuous collision detection to this wall. Small and fast projectiles will tunnel through other objects unless CCD is on. Defaults to true.
	linearDamping?: number; // Higher means receives less knockback
	angularDamping?: number; // Higher means less rotation on knockback

	categories?: number; // Use this to make a wall an impassable obstacle
	collideWith?: number;
	selfPassthrough?: boolean; // Whether to always allow the owner to pass through the wall

	strike?: RenderStrikeParams;
}

declare interface SaberSpell extends ShieldSpell {
	action: "saber";

	shiftMultiplier: number; // Move object by this proportion of the swing (ensures it doesn't get caught in the swing next tick and ends up sticking to the saber)
	speedMultiplier: number; // Accelerate object to the speed of the swing multiplied by this factor
	maxSpeed: number; // The maximum speed the saber can accelerate an object to
	maxTurnRatePerTickInRevs: number; // THe maximum speed the saber can be swung

	angleOffsetsInRevs: number[];
	length: number;
	width: number;
	growthTicks?: number;

	channelling?: boolean;
	maxTicks: number;

	categories: number;
	collidesWith: number;
	expireAfterHitHeroTicks?: number; // If set, saber will expire this many ticks after it hits an acolyte

	damageTemplate?: DamagePacketTemplate; // Damage to apply to anyone we hit
	hitInterval?: number; // If saber hits multiple times, only apply damage/buffs at this interval
	hitBuffs?: BuffTemplate[]; // Buffs to apply to whoever we hit
	delink?: boolean; // Cut through any links that other acolytes have attached to me

	colorize?: number;
	shine?: number;
	bloom?: number;
	glow?: number;
	strike?: RenderStrikeParams;
	trailTicks: number;
}

declare interface TeleportSpell extends SpellBase {
	action: "teleport";
	range: number;
}

declare interface ThrustSpell extends SpellBase {
    action: "thrust";

	range: number;
	speed: number;
	followCursor?: boolean;

	damageTemplate: DamagePacketTemplate;

	// Create a projectile at this interval
	projectileInterval?: number;
	projectile?: ProjectileTemplate;
}

declare interface RenderThrust {
	ticks: number;
}

declare interface KeyBindingOptions {
    [key: string]: string[][];
}

declare interface KeyBindings {
    [key: string]: string;
}

declare interface LinkParameters {
	linkWith: number; // Categories of object to link to

	selfFactor?: number; // How much should the link pull the hero towards the target
	targetFactor?: number; // How much should the link pull the target towards the hero

	impulsePerTick: number;
	sidewaysImpulsePerTick?: number; // How much should the link pull the target sideways
	massInvariant?: boolean; // Same force regardless of the mass that is being pulled

	linkTicks: number; // duration of the link
	linkTicksHero?: number; // duration of the link when attached to an acolyte
	minDistance: number;
	maxDistance: number;

	redirectDamage?: RedirectDamageParameters;
	channelling?: boolean;

	render?: RenderLink;
}

declare interface RedirectDamageParameters {
	selfProportion: number; // Proportion of damage to absorb when linked (0 means no damage)
	redirectProportion: number; // Proportion of damage to redirect when linked (1 means all damage)
	redirectAfterTicks: number; // Don't start redirecting damage until this many ticks have passed
}

declare interface DamagePacketTemplate {
	damage: number;
	lifeSteal?: number;
	isLava?: boolean;
	noHit?: boolean; // Don't count this as a hit - no hero flashing and no halo stripping
	noKnockback?: boolean; // Don't count as knockback - will not attribute future void damage to this hero
	minHealth?: number; // Never reduce the enemy below this level of health

	source?: string; // Damage/Lifesteal Buffs which have the same stack will be applied to this
}

declare interface Vec2 {
	x: number;
	y: number;
}

interface IconLookup {
	[key: string]: Icon;
}

interface Icon {
	path: string; // The SVG path of the icon
	credit?: string; // A link to where the icon is from - not used by the game, just to give credit to the author
}

type WaveType = "sine" | "square" | "sawtooth" | "triangle" | "brown-noise";

interface Sounds {
	[key: string]: Sound;
}

interface Sound {
	start?: SoundBite[];
	sustain?: SoundBite[];

	repeatIntervalSeconds?: number;
	cutoffSeconds?: number; // If this sound is stopped early, ramp volume to zero over this many seconds
	cutoffEarly?: boolean; // Whether to cutoff the sound early if the action is cancelled (e.g. if the spell stops charging). Defaults to true.

	intensityUpdateFactor?: number; // The rate at which the volume is adjusted to match intensity
	intensityDelay?: number; // The speed at which the volume changes to the new intensity

}

interface SoundBite {
	volume?: number;

	startTime?: number;
	stopTime: number;

	startFreq?: number;
    stopFreq?: number;

    tremoloFreq?: number;
	tremoloStrength?: number;

	modStartFreq?: number;
	modStopFreq?: number;
	modStartStrength?: number;
	modStopStrength?: number;

	highPass?: number;
	lowPass?: number;

	attack?: number;
	decay?: number;

	wave: WaveType;
	ratios?: number[];

	noReverb?: boolean;
}

interface VisualSettings {
	// Default visuals
	GradientAngleInRevs: number; // The angle at which to apply gradient shading to acolytes and obstacles
	DefaultFlashTicks: number;
	DefaultGlowRadius: number;

	// Map visuals
	Background: string;
	DefaultWorldColor: string;
	WorldStrokeProportion: number; // The width of the edge of the map
	WorldStrokeBrightness: number;
	WorldHexHeight: number; // Height in number of pixels for hexagons
	WorldHexWidth: number; // Height in number of pixels for hexagons
	WorldHexMask: number;
	WorldHexInterval: number; // Length of the hex light/dark cycle in ticks

	WorldAnimateWinTicks: number;
	WorldWinGrowth: number;
	WorldWinDarken: number; // Darken/lighten from the hero color by this proportion
	WorldWinBackgroundDarken: number; // Darken/lighten the background from the hero color by this proportion

	// How much to shake the map when projectiles hit
	ShakeDistance: number;
	ShakeTicks: number;
	ShakeCycles: number; // Shake back and forth this many times
	ShakeDampening: number; // Dampen the shaking cycles with this power

	// How much to flash the map when projectiles hit
	HighlightFactor: number;
	HighlightHexFactor: number; // Highlight the hexes on the map when hit
	HighlightHexShineFactor: number; // Brighter color for hexes on map when hit
	HighlightTicks: number;

	// Controls the rate at which acolytes arrive/depart
	EaseTicks: number;
	EaseInDistance: number;
	EasePower: number;
	ExitTicks: number;

	// Flash when acolytes turn
	TurnHighlightTicks: number; // How long to flash for
	TurnHighlightRevs: number; // Maximum flash when turning this many revolutions in a single tick
	TurnHighlightGrowth: number; // Acolyte becomes bigger when turning
	TurnHighlightFlash: number; // Acolyte flashes when turning

	// Spell casting visuals
	ChargingRadius: number;
	CastingFlashTicks: number;

	// Visuals when acolyte takes damage
	Damage: RenderStrikeParams;

	// Hero
	HeroOutlineProportion: number; // Width of the outline around the acolyte
	HeroOutlineColor: string; // Color of the outline around the acolyte
	HeroGradientDarken: number; // How much to shade the acolyte, between 0 and 1
	HeroGlyphLighten: number;
	HeroGlyphOpacity: number;
	HeroShadowOpacity: number;

	 // Display an X on the map when failed to cast
	CastFailedColor: string;
	CastFailedRadius: number;
	CastFailedLineWidth: number;
	CastFailedTicks: number;

	// Controls the name floating above the acolyte
	NameMargin: number;
	NameFontPixels: number;
	NameHeightPixels: number;
	NameWidthPixels: number;

	// Health bar floating above the acolyte
	HealthBarHeroRadiusFraction: number;
	HealthBarHeight: number;
	HealthBarMargin: number;

	// The buttons at the bottom of the screen
	ButtonBarMaxHeightProportion: number;
	ButtonBarSpacing: number;
	ButtonBarMargin: number;
	ButtonBarSize: number;
	ButtonBarGap: number;

	// Cursor size (on mobile only)
	CursorSizeInPixels: number;

	// Camera
	CameraPanRate: number;
	CameraZoomRate: number;

	CameraMaxZoom: number;
	CameraMinPixelsForZoom: number;
	CameraSmoothRate: number;

	CameraCenterTolerance: number;
	CameraZoomTolerance: number;

	// Acolyte colors
	MyHeroColor: string;
	AllyColor: string;
	BotColor: string;

	OnlineColor: string; // Color in the scoreboard if player not in your current game

	Colors: string[]; // List of all acolyte colors
	TeamColors: string[]; // List of all acolyte team colors

}

interface AudioSettings {
	MasterVolume: number;
	Reverbs: ReverbSettings[];
}

interface ReverbSettings {
	Volume: number;
	FilterType: string; // "lowpass" or "highpass" - whether to let through low or high frequencies
	CutoffFrequency: number;
	TimeSeconds: number; // How long the reverb should last
}
