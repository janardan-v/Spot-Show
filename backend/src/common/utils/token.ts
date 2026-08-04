import JWT from 'jsonwebtoken'


export interface UserTokenPayload {
    id: string
}


export function createAccessToken(payload: UserTokenPayload) {
    return JWT.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '24h' })
}

export function verifyAccessToken(token: string) {
    try {
        const payload = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as UserTokenPayload
        return payload
    }
    catch (error) {
        console.log("Invalid access token", error)
        return new Error("Invalid access token")
    }
}


export function createRefreshToken(payload: UserTokenPayload) {
    return JWT.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '24h' })
}

export function verifyRefreshToken(token: string) {
    try {
        const payload = JWT.verify(token, process.env.ACCESS_TOKEN_SECRE as string) as UserTokenPayload
        return payload
    }
    catch (error) {
        console.log("Invalid refresh token", error)
        return new Error("Invalid refresh token")
    }
}



