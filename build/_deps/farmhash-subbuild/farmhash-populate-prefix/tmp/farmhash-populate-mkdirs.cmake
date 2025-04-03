# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

# If CMAKE_DISABLE_SOURCE_CHANGES is set to true and the source directory is an
# existing directory in our source tree, calling file(MAKE_DIRECTORY) on it
# would cause a fatal error, even though it would be a no-op.
if(NOT EXISTS "C:/Users/rachi/OneDrive/Desktop/EEG_model/build/farmhash")
  file(MAKE_DIRECTORY "C:/Users/rachi/OneDrive/Desktop/EEG_model/build/farmhash")
endif()
file(MAKE_DIRECTORY
  "C:/Users/rachi/OneDrive/Desktop/EEG_model/build/_deps/farmhash-build"
  "C:/Users/rachi/OneDrive/Desktop/EEG_model/build/_deps/farmhash-subbuild/farmhash-populate-prefix"
  "C:/Users/rachi/OneDrive/Desktop/EEG_model/build/_deps/farmhash-subbuild/farmhash-populate-prefix/tmp"
  "C:/Users/rachi/OneDrive/Desktop/EEG_model/build/_deps/farmhash-subbuild/farmhash-populate-prefix/src/farmhash-populate-stamp"
  "C:/Users/rachi/OneDrive/Desktop/EEG_model/build/_deps/farmhash-subbuild/farmhash-populate-prefix/src"
  "C:/Users/rachi/OneDrive/Desktop/EEG_model/build/_deps/farmhash-subbuild/farmhash-populate-prefix/src/farmhash-populate-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "C:/Users/rachi/OneDrive/Desktop/EEG_model/build/_deps/farmhash-subbuild/farmhash-populate-prefix/src/farmhash-populate-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "C:/Users/rachi/OneDrive/Desktop/EEG_model/build/_deps/farmhash-subbuild/farmhash-populate-prefix/src/farmhash-populate-stamp${cfgdir}") # cfgdir has leading slash
endif()
