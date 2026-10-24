from uuid import uuid4
import boto3
from botocore.client import Config
from ..config import settings


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        region_name="us-east-1",
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )

def upload_image(file_bytes: bytes, content_type: str, user_id: int) -> str:
    if content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise ValueError("Можно только JPEG, PNG или WebP")

    if len(file_bytes) > 5 * 1024 * 1024:
        raise ValueError("Файл больше 5 МБ")

    ext = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    }[content_type]

    key = f"user-{user_id}/{uuid4().hex}.{ext}"

    client = get_s3_client()
    client.put_object(
        Bucket=settings.S3_BUCKET,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )

    return f"{settings.S3_PUBLIC_URL}/{key}"