# @content-collections/core

## 0.7.0

### Minor Changes

- [#200](https://github.com/sdorra/content-collections/pull/200) [`207a3de`](https://github.com/sdorra/content-collections/commit/207a3deaa95e34902c262ed8abc6320880b43dc2) Thanks [@sdorra](https://github.com/sdorra)! - Rebuild on configuration changes

- [`a1dd55b`](https://github.com/sdorra/content-collections/commit/a1dd55bcfe198487de40402284d907b977eedcec) Thanks [@sdorra](https://github.com/sdorra)! - Add count of collections and documents to build output

### Patch Changes

- [#237](https://github.com/sdorra/content-collections/pull/237) [`53efa50`](https://github.com/sdorra/content-collections/commit/53efa508125816e02b4d50e01241e021a67564a1) Thanks [@sdorra](https://github.com/sdorra)! - Fix usage of typescript aliases in configuration

## 0.6.4

### Patch Changes

- [#228](https://github.com/sdorra/content-collections/pull/228) [`8dc1da0`](https://github.com/sdorra/content-collections/commit/8dc1da0481d52a39f04fc6d153b945a8865eb6fe) Thanks [@sdorra](https://github.com/sdorra)! - Fixed watch on windows

## 0.6.3

### Patch Changes

- [#224](https://github.com/sdorra/content-collections/pull/224) [`a1c42c1`](https://github.com/sdorra/content-collections/commit/a1c42c10fe2081b9a9b6019fce69f9cd99ef3514) Thanks [@sdorra](https://github.com/sdorra)! - Fix frontmatter parsing in certain situations on Windows.

## 0.6.2

### Patch Changes

- [#195](https://github.com/sdorra/content-collections/pull/195) [`c4c9044`](https://github.com/sdorra/content-collections/commit/c4c904423c9b1f6c4d862cb77c12add1eb7e7156) Thanks [@sdorra](https://github.com/sdorra)! - Do now show type errors on defineConfig, if declaration is set to true in the tsconfig.

## 0.6.1

### Patch Changes

- [#194](https://github.com/sdorra/content-collections/pull/194) [`befba40`](https://github.com/sdorra/content-collections/commit/befba40fce91130616fc16e11bc6ee149be90e8b) Thanks [@sdorra](https://github.com/sdorra)! - mark all packages as external

- [#168](https://github.com/sdorra/content-collections/pull/168) [`a533052`](https://github.com/sdorra/content-collections/commit/a5330527ebe6ca6217ad2bbbb9a24c23785b7d89) Thanks [@sdorra](https://github.com/sdorra)! - #166 Start without cache, if the mapping.json could not be parsed.

## 0.6.0

### Minor Changes

- [#125](https://github.com/sdorra/content-collections/pull/125) [`2a6186d`](https://github.com/sdorra/content-collections/commit/2a6186dd46f69eeb9f90c4b10743b0f5338ec39b) Thanks [@sdorra](https://github.com/sdorra)! - Allow Date, Map, Set and BigInt as data types

### Patch Changes

- [`414aad1`](https://github.com/sdorra/content-collections/commit/414aad15c5485f4e8b78d3f35f4b97eeffe5f875) Thanks [@sdorra](https://github.com/sdorra)! - Add typescript peer dependency to indicate that at least version 5.0.2 is required

## 0.5.0

### Minor Changes

- [`968c5f3`](https://github.com/sdorra/content-collections/commit/968c5f358385019f2ef4cd9dbf1209c27da03e96) Thanks [@sdorra](https://github.com/sdorra)! - expose collection name and directory as part of the context

- [#47](https://github.com/sdorra/content-collections/pull/47) [`58e659b`](https://github.com/sdorra/content-collections/commit/58e659bef0f6604f4c3f991ae4d4c64c0350fc59) Thanks [@sdorra](https://github.com/sdorra)! - Add option to exclude files from collection

### Patch Changes

- [`7eed25d`](https://github.com/sdorra/content-collections/commit/7eed25de55622bf77c021e9d556bbe8d1d724a20) Thanks [@sdorra](https://github.com/sdorra)! - Export document type

## 0.4.1

### Patch Changes

- [`a2ee5db`](https://github.com/sdorra/content-collections/commit/a2ee5db541f684fad51f07440c9905159cc74bbc) Thanks [@Marviuz](https://github.com/Marviuz)! - Fix wrong import path on windows

## 0.4.0

### Minor Changes

- [#21](https://github.com/sdorra/content-collections/pull/21) [`5cbfe55`](https://github.com/sdorra/content-collections/commit/5cbfe55b8b8ddb1bc5520e18a0a29501077dd8ca) Thanks [@sdorra](https://github.com/sdorra)! - Validate the resulting objects and ensure that they can be serialized to json

### Patch Changes

- [#18](https://github.com/sdorra/content-collections/pull/18) [`871f95e`](https://github.com/sdorra/content-collections/commit/871f95e9ce5c9f57063045285e1ce058764199eb) Thanks [@sdorra](https://github.com/sdorra)! - Fix synchronization for multiple collections with the same directory

## 0.3.1

### Patch Changes

- [`037662a`](https://github.com/sdorra/content-collections/commit/037662a6b13634c09b0c04ff0001d0f5145686ab) Thanks [@sdorra](https://github.com/sdorra)! - Fix wrong entrypoint of core module

- [`9e591f1`](https://github.com/sdorra/content-collections/commit/9e591f15161aaaef5ca98834a810d87fc166010a) Thanks [@sdorra](https://github.com/sdorra)! - Exclude package dependencies of config bundling

## 0.3.0

### Minor Changes

- [`129088d`](https://github.com/sdorra/content-collections/commit/129088d4e12d049d56adf762dac210f120a45e22) Thanks [@sdorra](https://github.com/sdorra)! - Add cache function to context

- [`7b65d76`](https://github.com/sdorra/content-collections/commit/7b65d76afca5e291ed21b2805a6580e59075a314) Thanks [@sdorra](https://github.com/sdorra)! - #3 add support for json and yaml

- [`5cef04e`](https://github.com/sdorra/content-collections/commit/5cef04e7786f9369b89eac5b44c43249f4718f3b) Thanks [@sdorra](https://github.com/sdorra)! - Make document the first parameter of the transform function

- [`8eb192f`](https://github.com/sdorra/content-collections/commit/8eb192f14dac9badbce4d07c156df33dfb5b9672) Thanks [@sdorra](https://github.com/sdorra)! - Revert support for multiple directories in a single collection

### Patch Changes

- [`8c43837`](https://github.com/sdorra/content-collections/commit/8c438376b6912394ac402f107f95450f2f1b1dd2) Thanks [@sdorra](https://github.com/sdorra)! - Treat date values in frontmatter as string instead of Date object, see #4

## 0.2.0

### Minor Changes

- [`b6bfdff`](https://github.com/sdorra/content-collections/commit/b6bfdffea0b494ea437784a13bb2a21d17baa470) Thanks [@sdorra](https://github.com/sdorra)! - Collect files for one collection from multiple directories

- [`7f42cda`](https://github.com/sdorra/content-collections/commit/7f42cdacf76115d0b0c88e77ab7e018ed6930864) Thanks [@sdorra](https://github.com/sdorra)! - Fix changing order of files

## 0.1.2

### Patch Changes

- [`ca48b40`](https://github.com/sdorra/content-collections/commit/ca48b401518ed71bd019f9196fa3d3ad2fc777f9) Thanks [@sdorra](https://github.com/sdorra)! - Fix usage of watcher inside stackblitz

## 0.1.1

### Patch Changes

- [`b4f640b`](https://github.com/sdorra/content-collections/commit/b4f640b26f18dbe9eb8b3913428010194d918ad1) Thanks [@sdorra](https://github.com/sdorra)! - Reduce files published to npm
