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

def delete_image(image_url: str | None) -> None:
    if not image_url:
        return

    prefix = settings.S3_PUBLIC_URL.rstrip("/") + "/"
    if not image_url.startswith(prefix):
        return

    key = image_url[len(prefix):]
    if not key:
        return

    client = get_s3_client()
    client.delete_object(Bucket=settings.S3_BUCKET, Key=key)

def delete_user_images(user_id: int) -> None:
    """Удаляет все объекты с префиксом user-{id}/"""
    client = get_s3_client()
    prefix = f"user-{user_id}/"

    token = None
    while True:
        kwargs = {
            "Bucket": settings.S3_BUCKET,
            "Prefix": prefix,
            "MaxKeys": 1000,
        }
        if token:
            kwargs["ContinuationToken"] = token

        resp = client.list_objects_v2(**kwargs)
        for obj in resp.get("Contents") or []:
            client.delete_object(Bucket=settings.S3_BUCKET, Key=obj["Key"])

        if not resp.get("IsTruncated"):
            break
        token = resp.get("NextContinuationToken")