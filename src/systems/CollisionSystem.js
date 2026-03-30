export class CollisionSystem {
    static checkAABB(a, b) {
        const ha = a.hitbox;
        const hb = b.hitbox;
        return (
            ha.x < hb.x + hb.width &&
            ha.x + ha.width > hb.x &&
            ha.y < hb.y + hb.height &&
            ha.y + ha.height > hb.y
        );
    }

    static processCollisions(game) {
        const { soldier, projectiles, aliens, powerUps } = game;

        // Projectile vs Alien
        for (let pi = projectiles.length - 1; pi >= 0; pi--) {
            const proj = projectiles[pi];
            for (let ai = aliens.length - 1; ai >= 0; ai--) {
                const alien = aliens[ai];
                if (CollisionSystem.checkAABB(proj, alien)) {
                    const killed = alien.takeDamage(proj.damage);
                    projectiles.splice(pi, 1);

                    if (killed) {
                        game.onAlienKilled(alien);
                        aliens.splice(ai, 1);
                    }
                    break;
                }
            }
        }

        // Alien vs Soldier
        for (let ai = aliens.length - 1; ai >= 0; ai--) {
            const alien = aliens[ai];
            if (CollisionSystem.checkAABB(alien, soldier)) {
                soldier.takeDamage(1);
                aliens.splice(ai, 1);
                if (soldier.health <= 0) {
                    game.setState(game.constructor.name === 'Game' ? 'game-over' : 'game-over');
                }
            }
        }

        // PowerUp vs Soldier
        if (powerUps) {
            for (let pi = powerUps.length - 1; pi >= 0; pi--) {
                const pu = powerUps[pi];
                if (CollisionSystem.checkAABB(pu, soldier)) {
                    game.onPowerUpCollected(pu);
                    powerUps.splice(pi, 1);
                }
            }
        }
    }
}
