export class MimeIcons {
    public defaultIcon = "fa-regular fa-file-o";
    public mimes = {
        // Media
        'image': 'fa-regular fa-file-image',
        'audio': 'fa-regular fa-file-audio',
        'video': 'fa-regular fa-file-video',
        // Documents
        'application/pdf': 'fa-regular fa-file-pdf',
        'application/msword': 'fa-regular fa-file-word',
        'application/vnd.ms-word': 'fa-regular fa-file-word',
        'application/vnd.oasis.opendocument.text': 'fa-regular fa-file-word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml': 'fa-regular fa-file-word',
        'application/vnd.ms-excel': 'fa-regular fa-file-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml': 'fa-regular fa-file-excel',
        'application/vnd.oasis.opendocument.spreadsheet': 'fa-regular fa-file-excel',
        'application/vnd.ms-powerpoint': 'fa-regular fa-file-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml': 'fa-regular fa-file-powerpoint',
        'application/vnd.oasis.opendocument.presentation': 'fa-regular fa-file-powerpoint',
        'text/plain': 'fa-regular fa-file-alt',
        'text/html': 'fa-regular fa-file-code',
        'application/json': 'fa-regular fa-file-code',
        // Archives
        'application/gzip': 'fa-regular fa-file-archive',
        'application/zip': 'fa-regular fa-file-archive',
    }

    public getIcon(mimeType: string): string
    {

        if(this.mimes.hasOwnProperty(mimeType)) {
            return this.mimes[mimeType];
        }
        for (var key in this.mimes) {
            if (mimeType.search(key) === 0) {
                return this.mimes[key];
            }
        }

        return this.defaultIcon;
    }
}