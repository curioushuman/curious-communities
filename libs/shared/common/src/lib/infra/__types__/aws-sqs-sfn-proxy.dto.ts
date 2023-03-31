export interface SqsSfnProxyRequestDto<Dto> {
  id: string;
  stackId: string;
  prefix: string;
  dto: Dto;
}

/**
 * baseId is just the bare minimum e.g. participant-update. That's what we try and pass around,
 * everything else is contextual and builds on this base.
 */
export const prepareSqsSfnProxy = <Dto>(
  baseId: string,
  stackId: string,
  prefix = ''
): ((dto: Dto) => SqsSfnProxyRequestDto<Dto>) => {
  // NOTE: this pattern comes from
  // - generateThrottledResourceId()
  // - lambda-throttled.construct
  const stepFunctionsId = `${baseId}-throttled-destinations`;
  return (dto) => {
    return {
      id: stepFunctionsId,
      stackId,
      prefix,
      dto,
    };
  };
};
