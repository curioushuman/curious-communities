import { MemberSource } from '../../domain/entities/member-source';
import { MemberIdExternal } from '../../domain/value-objects/member-id-external';
import { MemberSourceStatus } from '../../domain/value-objects/member-source-status';

/**
 * A builder for Member Sources to play with in testing.
 */

/**
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

/**
 * This is basically a looser mimic of Member
 * For the purpose of being able to create invalid Members & DTOs and such
 */
type MemberSourceLooseMimic = {
  [K in keyof MemberSource]?: MemberSource[K] | string | number;
};

export const MemberSourceBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: MemberSourceLooseMimic = {
    id: '5008s1234519CjIAAU',
    status: 'open' as MemberSourceStatus,
    name: 'James Brown',
    email: 'james@brown.com',
    organisationName: 'Brown Co',
  };
  const overrides: MemberSourceLooseMimic = {
    id: defaultProperties.id,
    status: defaultProperties.status,
    name: defaultProperties.name,
    email: defaultProperties.email,
    organisationName: defaultProperties.organisationName,
  };

  return {
    funkyChars() {
      overrides.name = "I'm gonna be a dancer!";
      return this;
    },

    alpha() {
      overrides.id = '5000K1234567GEYQA3';
      overrides.name = 'Dance, like an alpha';
      return this;
    },

    beta() {
      overrides.id = '5008s000000y7LUAAY';
      overrides.name = 'Beta ray dancing';
      return this;
    },

    noMatchingSource() {
      return this;
    },

    invalidStatus() {
      overrides.name = 'Pending member';
      overrides.status = 'this is invalid';
      return this;
    },

    invalidSource() {
      overrides.name = '';
      return this;
    },

    exists() {
      overrides.id = MemberIdExternal.check('ThisSourceExists');
      return this;
    },

    updated() {
      overrides.id = MemberIdExternal.check('ThisSourceExists');
      overrides.name = 'Updated member';
      return this;
    },

    build(): MemberSource {
      return MemberSource.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): MemberSource {
      return {
        ...defaultProperties,
        ...overrides,
      } as MemberSource;
    },
  };
};
