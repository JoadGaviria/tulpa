"""Fetch the official npm CLI locally; does not modify PATH or install global tools."""
import io, pathlib, tarfile, urllib.request
root = pathlib.Path(__file__).resolve().parents[1]
target = root / '.tools' / 'npm'
if not (target / 'bin/npm-cli.js').exists():
    data = urllib.request.urlopen('https://registry.npmjs.org/npm/-/npm-10.9.4.tgz', timeout=60).read()
    target.mkdir(parents=True, exist_ok=True)
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
        for member in archive.getmembers():
            parts = pathlib.PurePosixPath(member.name).parts[1:]
            if not parts or member.issym() or member.islnk():
                continue
            destination = target.joinpath(*parts).resolve()
            if not destination.is_relative_to(target.resolve()):
                raise ValueError('Unsafe archive path')
            if member.isfile():
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(archive.extractfile(member).read())
print(target / 'bin/npm-cli.js')
