UPDATE user_t u
SET
    likes_count = (
        SELECT count(*) FROM favorite_account fa
        WHERE fa.target_user_id = u.id
    );