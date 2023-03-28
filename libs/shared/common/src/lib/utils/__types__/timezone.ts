interface TimezoneConfig {
  timezone?: {
    offset: number;
  };
}

export type ConfigWithTimezone = Record<string, unknown> & TimezoneConfig;
