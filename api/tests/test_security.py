"""인증·보안 단위 테스트"""
import pytest
from jose import JWTError
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
)


class TestPassword:
    def test_hash_differs_from_plain(self):
        assert hash_password("mypassword") != "mypassword"

    def test_verify_correct(self):
        hashed = hash_password("secret123")
        assert verify_password("secret123", hashed)

    def test_verify_wrong(self):
        hashed = hash_password("secret123")
        assert not verify_password("wrong", hashed)

    def test_same_password_different_hashes(self):
        h1 = hash_password("abc")
        h2 = hash_password("abc")
        assert h1 != h2  # bcrypt salt → 매번 다름

    def test_empty_password(self):
        hashed = hash_password("")
        assert verify_password("", hashed)


class TestJWT:
    USER_ID = "550e8400-e29b-41d4-a716-446655440000"

    def test_access_token_decodable(self):
        token = create_access_token(self.USER_ID)
        payload = decode_token(token)
        assert payload["sub"] == self.USER_ID
        assert payload["type"] == "access"

    def test_refresh_token_decodable(self):
        token = create_refresh_token(self.USER_ID)
        payload = decode_token(token)
        assert payload["sub"] == self.USER_ID
        assert payload["type"] == "refresh"

    def test_access_and_refresh_differ(self):
        at = create_access_token(self.USER_ID)
        rt = create_refresh_token(self.USER_ID)
        assert at != rt

    def test_invalid_token_raises(self):
        with pytest.raises(JWTError):
            decode_token("not.a.valid.token")

    def test_tampered_token_raises(self):
        token = create_access_token(self.USER_ID)
        tampered = token[:-5] + "XXXXX"
        with pytest.raises(JWTError):
            decode_token(tampered)
