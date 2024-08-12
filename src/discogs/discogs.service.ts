import { Injectable } from '@nestjs/common';

const DISCOGS_URL = 'https://api.discogs.com';
const SEARCH_URL = '/database/search?q={query}&{?type,title,release_title,credit,artist,anv,label,genre,style,country,year,format,catno,barcode,track,submitter,contributor}';

@Injectable()
export class DiscogsService {}
