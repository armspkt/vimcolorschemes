import URLHelper from '../helpers/url';
import { APIRepository } from './api';
import {
  Background,
  VimColorScheme,
  VimColorSchemeData,
} from './vimColorScheme';

export const REPOSITORY_COUNT_PER_PAGE = 20;

export class Repository {
  name: string;
  owner: Owner;
  description: string;
  githubCreatedAt: string;
  lastCommitAt: string;
  githubURL: string;
  stargazersCount: number;
  weekStargazersCount: number;
  vimColorSchemes: VimColorScheme[];

  constructor(apiRepository: APIRepository) {
    this.name = apiRepository.name;
    this.owner = apiRepository.owner;
    this.description = apiRepository.description;
    this.githubCreatedAt = apiRepository.githubCreatedAt;
    this.lastCommitAt = apiRepository.lastCommitAt;
    this.githubURL = apiRepository.githubURL;
    this.stargazersCount = apiRepository.stargazersCount;
    this.weekStargazersCount = apiRepository.weekStargazersCount;

    this.vimColorSchemes = (apiRepository.vimColorSchemes || [])
      .reduce((vimColorSchemes, vimColorScheme) => {
        if (vimColorScheme.valid) {
          return [...vimColorSchemes, new VimColorScheme(vimColorScheme)];
        }

        return vimColorSchemes;
      }, [] as VimColorScheme[])
      .sort((a, _b) => {
        if (a.backgrounds.includes(Background.Dark)) {
          return -1;
        }

        return 1;
      });
  }

  get key(): string {
    return `${this.owner.name}/${this.name}`;
  }

  get route(): string {
    return `/${URLHelper.URLify(this.key)}`.toLowerCase();
  }

  get title(): string {
    const name = this.flattenedVimColorSchemes[0]?.name || this.name;
    return `${name} vim color scheme, by ${this.owner.name}`;
  }

  get previewRoute(): string {
    return `${this.route}/preview`;
  }

  get previewImageRoute(): string {
    return `/previews/${this.owner.name}.${this.name}.preview.png`;
  }

  // Return all color scheme variations in a flat list
  get flattenedVimColorSchemes(): VimColorScheme[] {
    return this.vimColorSchemes.reduce(
      (vimColorSchemes: VimColorScheme[], vimColorScheme: VimColorScheme) => {
        if (!vimColorScheme.valid) {
          return vimColorSchemes;
        }

        const copies: VimColorScheme[] = vimColorScheme.backgrounds.map(
          background => {
            const copy = vimColorScheme.copy();
            copy.data = new VimColorSchemeData(null);
            copy.data[background] = vimColorScheme.data[background];
            return copy;
          },
        );

        return [...vimColorSchemes, ...copies];
      },
      [] as VimColorScheme[],
    );
  }

  get defaultVimColorScheme(): VimColorScheme {
    return this.flattenedVimColorSchemes[0];
  }
}

export interface Owner {
  name: string;
}

export interface RepositoryPageContext {
  ownerName: string;
  name: string;
}

export interface RepositoriesPageContext {
  skip: number;
  limit: number;
  sortProperty: Array<keyof Repository>;
  sortOrder: Array<'DESC' | 'ASC'>;
  pageCount: number;
  currentPage: number;
}
