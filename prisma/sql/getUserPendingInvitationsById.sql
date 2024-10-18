SELECT 
    oji.*,
    inviter.id AS inviter_id,
    inviter.full_name AS inviter_full_name,
    inviter.avatar_url AS inviter_avatar_url,
    inviter.email AS inviter_email,
    invitee.id AS invitee_id,
    invitee.full_name AS invitee_full_name,
    invitee.avatar_url AS invitee_avatar_url,
    invitee.email AS invitee_email,
    org.*
FROM 
    organization_join_invitations oji
LEFT JOIN 
    user_profiles inviter ON oji.inviter_user_id = inviter.id
LEFT JOIN 
    user_profiles invitee ON oji.invitee_user_id = invitee.id
LEFT JOIN 
    organizations org ON oji.organization_id = org.id
WHERE 
    oji.invitee_user_id = $1
    AND oji.status = 'active';