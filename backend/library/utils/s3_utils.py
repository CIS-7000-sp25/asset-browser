import boto3
from django.conf import settings

class S3Manager:
    def __init__(self):
        self.client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket = settings.AWS_BUCKET_NAME

    def generate_presigned_url(self, key, expires_in=60):
        return self.client.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket, 'Key': key}, # relative path to bucket
            ExpiresIn=expires_in
        )

    def upload_file(self, file, key):
        self.client.upload_fileobj(file, self.bucket, key)
    
    def delete_file(self, key):
        self.client.delete_object(Bucket=self.bucket, Key=key)

    def list_s3_files(self, prefix):
        paginator = self.client.get_paginator('list_objects_v2')
        result = []

        for page in paginator.paginate(Bucket=self.bucket, Prefix=prefix):
            for obj in page.get('Contents', []):
                result.append(obj['Key'])

        return result

    def download_s3_file(self, key):
        obj = self.client.get_object(Bucket=self.bucket, Key=key)
        return obj['Body'].read()  # this returns bytes
