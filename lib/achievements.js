import { query } from "./db";

export async function checkAchievements(userId) {
  try {
    const newlyUnlocked = [];
    const achievements = await query("SELECT * FROM achievements");
    const userUnlocked = await query(
      "SELECT achievement_id FROM user_achievements WHERE user_id = $1",
      [userId]
    );
    const unlockedIds = new Set(userUnlocked.rows.map(r => r.achievement_id));

    for (const achievement of achievements.rows) {
      if (unlockedIds.has(achievement.id)) continue;

      let isUnlocked = false;

      switch (achievement.condition_type) {
        case 'no_delivery_7d':
        case 'saver':
          const noDeliveryRes = await query(`
            SELECT COUNT(*) as count 
            FROM transactions 
            WHERE user_id = $1 
            AND type = 'expense'
            AND (name ILIKE '%delivery%' OR name ILIKE '%ifood%' OR category = 'Alimentação')
            AND date >= CURRENT_DATE - INTERVAL '7 days'
          `, [userId]);
          if (parseInt(noDeliveryRes.rows[0].count) === 0) {
            isUnlocked = true;
          }
          break;

        case 'goal_reached_100':
        case 'goal_master':
          const goalRes = await query(`
            SELECT COUNT(*) as count 
            FROM goals 
            WHERE user_id = $1 AND current_amount >= target_amount
          `, [userId]);
          if (parseInt(goalRes.rows[0].count) > 0) {
            isUnlocked = true;
          }
          break;

        case 'first_investment':
          const investRes = await query(`
            SELECT COUNT(*) as count 
            FROM transactions 
            WHERE user_id = $1 AND category = 'Investimentos'
          `, [userId]);
          if (parseInt(investRes.rows[0].count) > 0) {
            isUnlocked = true;
          }
          break;

        case '7_day_streak':
        case 'consistency':
          const streakRes = await query(`
            WITH RECURSIVE dates AS (
              SELECT CAST(date AS DATE) as d
              FROM transactions
              WHERE user_id = $1 AND type = 'expense'
              GROUP BY d
            ),
            streak AS (
              SELECT d, 1 as count
              FROM dates
              WHERE d = CURRENT_DATE
              UNION ALL
              SELECT dates.d, streak.count + 1
              FROM dates
              JOIN streak ON dates.d = streak.d - INTERVAL '1 day'
            )
            SELECT MAX(count) as max_streak FROM streak
          `, [userId]);
          const currentStreak = parseInt(streakRes.rows[0].max_streak || 0);
          if (currentStreak >= 7) {
            isUnlocked = true;
          }
          break;

        case 'reduced_spending_category':
        case 'smart_spender':
          const spendingRes = await query(`
            WITH current_month AS (
              SELECT category, SUM(amount) as total
              FROM transactions
              WHERE user_id = $1 AND type = 'expense'
              AND date >= date_trunc('month', CURRENT_DATE)
              GROUP BY category
            ),
            last_month AS (
              SELECT category, SUM(amount) as total
              FROM transactions
              WHERE user_id = $1 AND type = 'expense'
              AND date >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
              AND date < date_trunc('month', CURRENT_DATE)
              GROUP BY category
            )
            SELECT c.category
            FROM current_month c
            JOIN last_month l ON c.category = l.category
            WHERE c.total < l.total
          `, [userId]);
          if (spendingRes.rows.length > 0) {
            isUnlocked = true;
          }
          break;
      }

      if (isUnlocked) {
        await query(
          "INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [userId, achievement.id]
        );
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error("Error checking achievements:", error);
    return [];
  }
}

export async function getUserAchievementsWithProgress(userId) {
  try {
    const res = await query(`
      SELECT a.*, (ua.unlocked_at IS NOT NULL) as unlocked, ua.unlocked_at
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
      ORDER BY a.id ASC
    `, [userId]);

    const achievements = res.rows;

    for (const ach of achievements) {
      if (ach.unlocked) {
        ach.progress = 100;
        ach.current_value = ach.target_value;
        continue;
      }

      // Calculate progress for locked achievements
      let currentVal = 0;
      switch (ach.condition_type) {
        case 'no_delivery_7d':
        case 'saver':
          const noDeliveryRes = await query(`
            SELECT COUNT(DISTINCT date) as days
            FROM (
              SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date as date
            ) d
            LEFT JOIN transactions t ON d.date = t.date 
              AND t.user_id = $1 
              AND t.type = 'expense'
              AND (t.name ILIKE '%delivery%' OR t.name ILIKE '%ifood%' OR t.category = 'Alimentação')
            WHERE t.id IS NULL
          `, [userId]);
          currentVal = parseInt(noDeliveryRes.rows[0].days || 0);
          break;

        case '7_day_streak':
        case 'consistency':
          const streakRes = await query(`
            WITH RECURSIVE dates AS (
              SELECT CAST(date AS DATE) as d
              FROM transactions
              WHERE user_id = $1 AND type = 'expense'
              GROUP BY d
            ),
            streak AS (
              SELECT d, 1 as count
              FROM dates
              WHERE d = CURRENT_DATE
              UNION ALL
              SELECT dates.d, streak.count + 1
              FROM dates
              JOIN streak ON dates.d = streak.d - INTERVAL '1 day'
            )
            SELECT MAX(count) as max_streak FROM streak
          `, [userId]);
          currentVal = parseInt(streakRes.rows[0].max_streak || 0);
          break;
        
        case 'goal_reached_100':
        case 'goal_master':
          const goalProgressRes = await query(`
            SELECT MAX(current_amount / target_amount * 100) as max_prog
            FROM goals WHERE user_id = $1
          `, [userId]);
          currentVal = Math.min(100, Math.round(Number(goalProgressRes.rows[0].max_prog || 0)));
          break;
          
        default:
          currentVal = 0;
      }
      
      ach.current_value = currentVal;
      ach.progress = Math.min(100, Math.round((currentVal / ach.target_value) * 100));
    }

    return achievements;
  } catch (error) {
    console.error("Error getting user achievements with progress:", error);
    return [];
  }
}
