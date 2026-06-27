package com.docG.DoctorG.service;

import com.docG.DoctorG.dto.request.*;
import com.docG.DoctorG.dto.response.*;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    RefreshTokenResponse refreshToken(RefreshTokenRequest request);
}
