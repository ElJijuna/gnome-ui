export type PackageEcosystem =
  | 'alpine'
  | 'cargo'
  | 'composer'
  | 'deb'
  | 'generic'
  | 'gem'
  | 'go'
  | 'maven'
  | 'npm'
  | 'nuget'
  | 'pypi'
  | 'rpm';

export interface PackageCoordinate {
  ecosystem: PackageEcosystem | string;
  name: string;
  version?: string;
}

export function formatPackageCoordinate({ ecosystem, name, version }: PackageCoordinate) {
  return `${ecosystem}:${name}${version ? `@${version}` : ''}`;
}

export function getPackageUrl({ ecosystem, name, version }: PackageCoordinate) {
  const encodedName = encodeURIComponent(name);
  const encodedVersion = version ? `@${encodeURIComponent(version)}` : '';

  return `pkg:${encodeURIComponent(ecosystem)}/${encodedName}${encodedVersion}`;
}
